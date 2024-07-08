import { Octokit } from "@octokit/rest";

type BranchManagerOptions = {
  octokit: Octokit;
  repo: string;
  owner: string;
};

export async function createBranch(
  { octokit, repo, owner }: BranchManagerOptions,
  branchName: string,
  baseBranch: string
): Promise<string> {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/git/refs/heads/{baseBranch}",
      {
        owner,
        repo,
        baseBranch,
      }
    );
    const sha = data.object.sha;

    await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });
    return `Branch ${branchName} created successfully from ${baseBranch} with sha: ${sha}`;
  } catch (error: any) {
    return `Error creating branch: ${error.message}`;
  }
}

export async function updateBranch(
  { octokit, repo, owner }: BranchManagerOptions,
  branchName: string,
  newBase: string
): Promise<string> {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/git/refs/heads/{newBase}",
      {
        owner,
        repo,
        newBase,
      }
    );
    const sha = data.object.sha;

    await octokit.request(
      "PATCH /repos/{owner}/{repo}/git/refs/heads/{branchName}",
      {
        owner,
        repo,
        branchName,
        sha,
      }
    );
    return `Branch ${branchName} updated successfully to base ${newBase}`;
  } catch (error: any) {
    return `Error updating branch: ${error.message}`;
  }
}

export async function deleteBranch(
  { octokit, repo, owner }: BranchManagerOptions,
  branchName: string
): Promise<string> {
  try {
    await octokit.request(
      "DELETE /repos/{owner}/{repo}/git/refs/heads/{branchName}",
      {
        owner,
        repo,
        branchName,
      }
    );
    return `Branch ${branchName} deleted successfully`;
  } catch (error: any) {
    return `Error deleting branch: ${error.message}`;
  }
}

export async function listBranches({
  octokit,
  repo,
  owner,
}: BranchManagerOptions): Promise<any[] | string> {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/branches",
      {
        owner,
        repo,
      }
    );
    return data.map((branch) => branch.name);
  } catch (error: any) {
    return `Error listing branches: ${error.message}`;
  }
}
