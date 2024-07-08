import { Probot } from "probot";
import {
  BranchManagerSchemas,
  GithubReaderSchemas,
  GithubWriterSchemas,
  IssueManagerSchemas,
  PullRequestManagerSchemas,
} from "../../modules/github/GithubSchema";
import Claude from "../../modules/ai/claude";
import GithubAPI from "../../modules/github";

export const handleIssues = (app: Probot) => {
  if (process.env.HANDLE_ISSUES !== "yes") {
    return console.log("ISSUES are disabled!");
  }

  app.on(["issues.reopened", "issues.labeled"], async (context: any) => {
    const { octokit } = context;
    const {
      payload: {
        issue: { number, title, body, user, labels },
      },
    } = context;
    const { repo, owner } = context.repo();

    // Fetch the default branch of the repo
    const { data: repoData } = await octokit.request(
      "GET /repos/{owner}/{repo}",
      {
        owner,
        repo,
      }
    );
    const defaultBranch = repoData.default_branch;

    // Now fetch the head commit of the default branch
    const { data: headData } = await octokit.request(
      "GET /repos/{owner}/{repo}/git/refs/heads/{ref}",
      {
        owner,
        repo,
        ref: defaultBranch,
      }
    );
    const headSha = headData.object.sha;

    const botName = process.env.BOT_NAME;
    const hasBotLabel = labels.some(
      (label) => String(label.name).toLowerCase() === botName
    );

    if (!hasBotLabel && process.env.WITH_LABEL === "yes") return;

    const claude = new Claude();

    const functions = [
      ...GithubReaderSchemas,
      ...GithubWriterSchemas,
      ...BranchManagerSchemas,
      ...IssueManagerSchemas,
      ...PullRequestManagerSchemas,
    ];

    const system =
      "You're an AI bot in a GitHub repo, here to help with code changes, refactoring, and maintenance. Use predefined functions to interact with the repo, read files, create branches, write to files, commit changes, and initiate pull requests.";

    const initialMessages = [
      {
        role: "user",
        content: `Issue #${number}, titled '${title}', was opened by ${user.login}. Description: '${body}'. 
            Tasks:
            First Comment on the issue to let know you're on it, then:
            1. Read necessary files to understand the issue.
            2. Create a new branch from head commit SHA: '${headSha}' on default branch '${defaultBranch}'.
            3. Make code modifications to address the issue.
            4. Commit changes and create a new pull request against the default branch.
            If the issue is complex, comment on it explaining why a pull request can't be made now.
            If you fail to access resources leave a comment for maintainers to install permissions or reinstall the Github app, or visit https://chatcody.com to learn more`,
      },
    ];

    console.log(initialMessages[0].content);

    await claude.recursiveClaudeCall(
      { octokit, owner, repo },
      GithubAPI,
      initialMessages,
      functions,
      system
    );
  });
};
