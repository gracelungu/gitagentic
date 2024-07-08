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
    ["pull_request.opened", "pull_request.reopened", "pull_request.labeled"],
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
          content: `
          Be brief and only review if necessary, otherwise just comment LGTM.
          use the function to addLineCommentToPullRequest to comment on each file changed
          New pull request up for review:
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
              `,
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

async function fetchPRReviewConversation(reviewId: number, context: any) {
  try {
    const { data: review } = await context.octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}",
      {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        pull_number: context.payload.pull_request.number,
        review_id: reviewId,
      }
    );

    return `Reviewer: @${review.user.login} said: ${review.body}`;
  } catch (error) {
    console.error(`Failed to fetch review conversation: ${error}`);
    return [];
  }
}


export const handlePullRequestsComments = (app: Probot) => {
  app.on("pull_request_review.submitted", async (context: any) => {
    if (process.env.HANDLE_PULL_REQUEST !== "yes") {
      return console.log("PULL_REQUESTS are disabled!");
    }

    const { octokit, payload } = context;
    const owner = payload.repository.owner.login;

    const claude = new Claude();

    const { review } = payload;
    const pullNumber = review.pull_request_url.split("/").pop();
    const reviewAuthor = review.user.login;
    const botName = process.env.BOT_NAME;

    if (
      reviewAuthor.includes(String(botName).toLowerCase())
    )
      return;

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

    const reviewMessage = await fetchPRReviewConversation(
      review.id,
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
        content: `New review ID: ${review.id} on PR:
          - Title: '${title}'
          - By: ${user.login}
          - PR #: ${number}
          - Description: '${body}'
          - Commit ID: ${commit_id}
          - Head: ${headName}
          - Base: ${baseName}
          Patches and paths:\n\n${patchStrings}.

          Review:
          ${reviewMessage}
          
          Tasks:
          1. Reply to reviews using review id: ${review.id} if they are about your changes.
          2. Make needed code adjustments based on reviews.
    
          Only comment if there are discrepancies to address, and make your feedback short and concise.
          If you fail to access resources leave a comment for maintainers to install permissions or reinstall the Github app.
          `,
      }
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

