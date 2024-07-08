import { Octokit } from "@octokit/rest";

type PullRequestManagerOptions = {
  octokit: Octokit;
  repo: string;
  owner: string;
};

export async function createPullRequest(
  { octokit, repo, owner }: PullRequestManagerOptions,
  title: string,
  body: string,
  head: string,
  base: string
): Promise<string> {
  try {
    await octokit.request("POST /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      title,
      body,
      head,
      base,
    });
    return `Pull request '${title}' has been successfully created.`;
  } catch (error: any) {
    console.error("An error occurred:", error);
    return `Failed to create pull request. Error: ${error.message}`;
  }
}

export async function updatePullRequest(
  { octokit, repo, owner }: PullRequestManagerOptions,
  prNumber: number,
  title: string,
  body: string
): Promise<string> {
  try {
    await octokit.request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
      owner,
      repo,
      pull_number: prNumber,
      title,
      body,
    });
    return `Pull request #${prNumber} has been successfully updated.`;
  } catch (error: any) {
    console.error("An error occurred:", error);
    return `Failed to update pull request. Error: ${error.message}`;
  }
}

export async function closePullRequest(
  { octokit, repo, owner }: PullRequestManagerOptions,
  prNumber: number
): Promise<string> {
  try {
    await octokit.request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
      owner,
      repo,
      pull_number: prNumber,
      state: "closed",
    });
    return `Pull request #${prNumber} has been successfully closed.`;
  } catch (error: any) {
    console.error("An error occurred:", error);
    return `Failed to close pull request. Error: ${error.message}`;
  }
}

export async function listPullRequests(
  { octokit, repo, owner }: PullRequestManagerOptions,
  state: "open" | "closed" | "all" = "open"
): Promise<any[] | string> {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner,
      repo,
      state,
    });
    return data;
  } catch (error: any) {
    console.error("An error occurred:", error);
    return `Failed to retrieve the list of pull requests. Error: ${error.message}`;
  }
}

export async function addCommentToPullRequest(
  { octokit, repo, owner }: PullRequestManagerOptions,
  prNumber: number,
  body: string
): Promise<string> {
  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner,
        repo,
        issue_number: prNumber,
        body,
      }
    );
    return `Comment has been successfully added to pull request #${prNumber}.`;
  } catch (error: any) {
    console.error("An error occurred:", error);
    return `Failed to add comment to pull request. Error: ${error.message}`;
  }
}

export async function addLineCommentToPullRequest(
  { octokit, repo, owner }: PullRequestManagerOptions,
  prNumber: number,
  commitId: string,
  body: string,
  path: string,
  position: number
): Promise<string> {
  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      {
        owner,
        repo,
        pull_number: prNumber,
        commit_id: commitId,
        body,
        path,
        position,
      }
    );
    return `Line comment has been successfully added to pull request #${prNumber}.`;
  } catch (error: any) {
    console.error("An error occurred:", error);
    return `Failed to add line comment to pull request. Error: ${error.message}`;
  }
}

export async function addReplyToPullRequestComment(
  { octokit, repo, owner }: PullRequestManagerOptions,
  prNumber: number,
  commentId: number,
  body: string
): Promise<string> {
  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies",
      {
        owner,
        repo,
        pull_number: prNumber,
        body,
        comment_id: commentId,
      }
    );
    return `Reply has been successfully added to comment #${commentId} on pull request #${prNumber}.`;
  } catch (error: any) {
    return `Failed to add reply to comment. Error: ${error.message}`;
  }
}
