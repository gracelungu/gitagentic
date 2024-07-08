import { Octokit } from "@octokit/rest";

type GithubWriterOptions = {
  octokit: Octokit;
  repo: string;
  owner: string;
};

export async function createOrUpdateFile(
  { octokit, repo, owner }: GithubWriterOptions,
  branch: string,
  filePath: string,
  content: string,
  commitMessage: string
): Promise<string> {
  try {
    let sha;
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
      if (data && data.sha) {
        sha = data.sha;
      }
    } catch (error: any) {
      if (error.status !== 404) {
        console.error("Error fetching file:", error.message);
        return "Error fetching file: " + error.message;
      }
    }

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(content).toString("base64"),
      branch,
      sha,
    });

    return "File has been successfully created or updated!";
  } catch (error: any) {
    return "Failed to create or update file: " + error.message;
  }
}

export async function deleteFile(
  { octokit, repo, owner }: GithubWriterOptions,
  branch: string,
  filePath: string,
  commitMessage: string
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

    if (Array.isArray(data) || !("sha" in data)) {
      throw new Error(
        "The specified path is not a file or the file SHA could not be obtained."
      );
    }

    await octokit.request("DELETE /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      sha: data.sha,
      branch,
    });
    return "File has been successfully deleted!";
  } catch (error: any) {
    return `Failed to delete file:', ${error.message}`;
  }
}

export async function deleteFilesInFolder(
  options: GithubWriterOptions,
  branch: string,
  folderPath: string,
  commitMessage: string
): Promise<string> {
  try {
    const { data } = await options.octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}?ref={ref}",
      {
        owner: options.owner,
        repo: options.repo,
        path: folderPath,
        ref: branch,
      }
    );

    if (!Array.isArray(data)) {
      return "The specified path is not a folder.";
    }

    for (const item of data) {
      if (item.type === "file") {
        await deleteFile(options, branch, item.path, commitMessage);
      } else if (item.type === "dir") {
        await deleteFilesInFolder(options, branch, item.path, commitMessage);
      }
    }

    return "Folder and its contents have been successfully deleted!";
  } catch (error: any) {
    return `Failed to delete folder contents:', ${error.message}`;
  }
}
