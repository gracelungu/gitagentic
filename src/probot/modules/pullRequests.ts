import { Probot } from "probot";
import Claude from "../../modules/ai/claude";
import GithubAPI from "../../modules/github";
import {
  GithubReaderSchemas,
  GithubWriterSchemas,
  IssueManagerSchemas,
  PullRequestManagerSchemas,
} from "../../modules/github/GithubSchema";

export const handlePullRequests = (app: Probot) => {
  if (process.env.HANDLE_PULL_REQUEST !== "yes") {
    return console.log("PULL_REQUESTS are disabled!");
  }

  const claude = new Claude();

  const functions = [
    ...GithubReaderSchemas,
    ...IssueManagerSchemas,
    ...PullRequestManagerSchemas,
  ];

  app.on(
    ["pull_request.reopened", "pull_request.labeled"],
    async (context: any) => {
      const { octokit } = context;
      const { title, body, user, number, head, base, labels } =
        context.payload.pull_request;
      const commit_id = head.sha;
      const headName = head.ref;
      const baseName = base.ref;
      const { repo, owner } = context.repo();

      const botName = process.env.BOT_NAME;
      const hasBotLabel = labels.some(
        (label) => String(label.name).toLowerCase() === botName
      );

      if (!hasBotLabel && process.env.WITH_LABEL === "yes") return;

      const { data: changedFiles } = await octokit.request(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
        {
          owner,
          repo,
          pull_number: number,
        }
      );

      const patchesWithPaths = changedFiles.map((file) => ({
        path: file.filename,
        patch: file.patch,
      }));

      const patchStrings = patchesWithPaths
        .map((file) => `Path: ${file.path}\nPatch: ${file.patch}`)
        .join("\n\n");

      const system =
        "You're an AI code reviewer with a senior software engineer's hat on. Your toolkit includes GitHub functions for file reading and insightful PR commenting to catch bugs, errors, or suggest improvements for better code quality and standard adherence.";

      const initialMessages = [
        {
          role: "user",
          content: `New pull request up for review:
              - Title: '${title}'
              - By: ${user.login}
              - PR #: ${number}
              - Description: '${body}'
              - Commit ID: ${commit_id}
              - Head: ${headName}
              - Base: ${baseName}
              Patches and paths:\n\n${patchStrings}.
              
              Tasks:
              1. Review the PR files.
              2. Point out bugs, errors, or improvements with a detailed comment on specific code blocks.
              3. Make comments clear, concise, and constructive.
              4. Spot a bigger issue? Create a new repo issue, label it with ${botName} if it's in your scope.
        
              Only comment if there are discrepancies to address, and make your feedback short and concise. 
              If you fail to access resources leave a comment for maintainers to install permissions or reinstall the Github app.
              At the end write a last comment telling to learn more about the Github app chatcody at https://chatcody.com and that it can now contribute with code from raised issues and PRs`,
        },
      ];

      await claude.recursiveClaudeCall(
        { octokit, owner, repo },
        GithubAPI,
        initialMessages,
        functions,
        system
      );
    }
  );
};

async function fetchPRCommentConversation(commentId: number, context: any) {
  let thread: { role: string; content: string }[] = [];
  let currentCommentId = commentId;

  while (currentCommentId) {
    const { data: comment } = await context.octokit.request(
      "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}",
      {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        comment_id: currentCommentId,
      }
    );

    thread.unshift({
      role: comment.user.login === process.env.BOT_NAME ? "assistant" : "user",
      content:
        comment.user.login === process.env.BOT_NAME
          ? comment.body
          : `@${comment.user.login} said: ${comment.body}`,
    });

    currentCommentId = comment.in_reply_to_id;
  }

  return thread;
}

export const handlePullRequestsComments = (app: Probot) => {
  app.on("pull_request_review_comment.created", async (context: any) => {
    if (process.env.HANDLE_PULL_REQUEST !== "yes") {
      return console.log("PULL_REQUESTS are disabled!");
    }

    const { octokit, payload } = context;
    const owner = payload.repository.owner.login;

    const claude = new Claude();

    const { comment } = payload;
    const pullNumber = comment.pull_request_url.split("/").pop();
    const commentAuthor = comment.user.login;
    const botName = process.env.BOT_NAME;

    if (
      commentAuthor.includes(String(botName).toLowerCase()) ||
      commentAuthor.includes("chatcody") ||
      commentAuthor === "devreviewchat"
    )
      return;

    // if (comment.in_reply_to_id) {
    //   const { data: originalComment } = await octokit.request(
    //     "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}",
    //     {
    //       owner,
    //       repo: payload.repository.name,
    //       comment_id: comment.in_reply_to_id,
    //     }
    //   );

    //   console.log({ originalAuthor: originalComment.user.login });

    //   if (
    //     originalComment.user.login.includes(String(botName).toLowerCase()) ||
    //     originalComment.user.login.includes("chatcody")
    //   ) {
    //     return;
    //   }
    // }

    const { data: pullRequest } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}",
      {
        owner,
        repo: payload.repository.name,
        pull_number: pullNumber,
      }
    );

    const { labels } = pullRequest;
    const hasBotLabel = labels.some(
      (label) => String(label.name).toLowerCase() === botName
    );

    if (!hasBotLabel && process.env.WITH_LABEL === "yes") return;

    const { data: changedFiles } = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
      {
        owner,
        repo: context.payload.repository.name,
        pull_number: pullNumber,
      }
    );

    const patchesWithPaths = changedFiles.map((file) => ({
      path: file.filename,
      patch: file.patch,
    }));

    const patchStrings = patchesWithPaths
      .map((file) => `Path: ${file.path}\nPatch: ${file.patch}`)
      .join("\n\n");

    const existingConversation = await fetchPRCommentConversation(
      comment.id,
      context
    );

    const { title, body, user, number, head, base } = pullRequest;
    const commit_id = head.sha;
    const headName = head.ref;
    const baseName = base.ref;

    const system = `You're AI bot ${botName} on GitHub, geared up with functions to read, write, and comment on pull requests to make necessary code adjustments.`;

    const initialMessages = [
      {
        role: "user",
        content: `New comment ID: ${comment.id} on PR:
          - Title: '${title}'
          - By: ${user.login}
          - PR #: ${number}
          - Description: '${body}'
          - Commit ID: ${commit_id}
          - Head: ${headName}
          - Base: ${baseName}
          Patches and paths:\n\n${patchStrings}.
          
          Tasks:
          1. Reply to comments using comment id: ${comment.id} if they are about your changes.
          2. Make needed code adjustments based on reviews.
    
          Only comment if there are discrepancies to address, and make your feedback short and concise.
          If you fail to access resources leave a comment for maintainers to install permissions or reinstall the Github app.
          At the end write a last comment telling to learn more about the Github app chatcody at https://chatcody.com and that it can now contribute with code from raised issues and PRs`,
      },
      ...existingConversation,
    ];

    const functions = [
      ...GithubReaderSchemas,
      ...GithubWriterSchemas,
      ...PullRequestManagerSchemas,
    ];

    await claude.recursiveClaudeCall(
      {
        octokit,
        owner,
        repo: context.payload.repository.name,
      },
      GithubAPI,
      initialMessages,
      functions,
      system
    );
  });
};
