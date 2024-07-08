import { Octokit } from "@octokit/rest";

type IssueManagerOptions = {
  octokit: Octokit;
  repo: string;
  owner: string;
};

export async function createIssue(
  { octokit, repo, owner }: IssueManagerOptions,
  title: string,
  body: string,
  labels: string[] = []
): Promise<string> {
  try {
    await octokit.request("POST /repos/{owner}/{repo}/issues", {
      owner,
      repo,
      title,
      body,
      labels,
    });
    return `Issue with title '${title}' has been successfully created.`;
  } catch (error: any) {
    return `Error creating issue: ${error.message}`;
  }
}

export async function updateIssue(
  { octokit, repo, owner }: IssueManagerOptions,
  issueNumber: number,
  title: string,
  body: string,
  labels: string[] = []
): Promise<string> {
  try {
    await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
      owner,
      repo,
      issue_number: issueNumber,
      title,
      body,
      labels,
    });
    return `Successfully updated issue #${issueNumber}.`;
  } catch (error: any) {
    return `Error updating issue: ${error.message}`;
  }
}

export async function deleteIssue(
  { octokit, repo, owner }: IssueManagerOptions,
  issueNumber: number
): Promise<string> {
  try {
    await octokit.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
      owner,
      repo,
      issue_number: issueNumber,
      state: "closed",
    });
    return `Successfully closed issue #${issueNumber}.`;
  } catch (error: any) {
    return `Error closing issue: ${error.message}`;
  }
}

export async function listIssues(
  { octokit, repo, owner }: IssueManagerOptions,
  state: "open" | "closed" | "all" = "open"
): Promise<any> {
  try {
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner,
      repo,
      state,
    });
    return data;
  } catch (error: any) {
    return `Error fetching issue list: ${error.message}`;
  }
}

export async function commentOnIssue(
  { octokit, repo, owner }: IssueManagerOptions,
  issueNumber: number,
  commentBody: string
): Promise<string> {
  try {
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner,
      repo,
      issue_number: issueNumber,
      body: commentBody
    });
    return 'Comment has been successfully posted!';
  } catch (error: any) {
    return 'Failed to comment on issue: ' + error.message;
  }
}
