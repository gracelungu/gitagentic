import { Octokit } from "@octokit/rest";

type GithubReaderOptions = {
  octokit: Octokit;
  repo: string;
  owner: string;
};

type FileTreeItem = {
  path: string | undefined;
  type: string | undefined;
  sha: string | undefined;
};

export async function getRepoFileTree(
  { octokit, repo, owner }: GithubReaderOptions,
  branch: string,
  startPath: string = "" // Default to root if no startPath provided
): Promise<FileTreeItem[] | string> {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/git/trees/{tree_sha}:{path}",
      {
        owner,
        repo,
        tree_sha: branch,
        path: startPath,
        recursive: "1",
      }
    );
    return data.tree
      .filter((item) => item.path && item.type && item.sha)
      .map((item) => ({
        path: item.path,
        type: item.type,
        sha: item.sha,
      }));
  } catch (error: any) {
    return `Failed to fetch repo tree:", ${error?.message}`;
  }
}

export async function readFile(
  { octokit, repo, owner }: GithubReaderOptions,
  branch: string,
  filePath: string
): Promise<string> {
  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={ref}",
      {
        owner,
        repo,
        path: filePath,
        ref: branch,
      }
    );
    if (typeof data === "object" && "content" in data) {
      const fileContent = Buffer.from(data.content, "base64").toString("utf8");
      return fileContent;
    } else {
      return "Content not found in data object";
    }
  } catch (error: any) {
    return `Failed to read file: ${error?.message}`;
  }
}
