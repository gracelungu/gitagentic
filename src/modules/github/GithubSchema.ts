type FunctionParameterSchema = {
  type: string;
  properties?: Record<
    string,
    { type: string; description?: string; enum?: string[]; default?: string }
  >;
  required?: string[];
};

type FunctionSchema = {
  name: string;
  description?: string;
  parameters?: FunctionParameterSchema;
};

// GithubWriter Schemas
export const GithubWriterSchemas: FunctionSchema[] = [
  {
    name: "createOrUpdateFile",
    description:
      "Creates a new file or updates an existing file within a specified branch of a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "The branch to create or update the file in",
        },
        filePath: {
          type: "string",
          description: "The path to the file to create or update",
        },
        content: { type: "string", description: "The content for the file" },
        commitMessage: { type: "string", description: "The commit message" },
      },
      required: ["branch", "filePath", "content", "commitMessage"],
    },
  },
  {
    name: "deleteFile",
    description:
      "Deletes a specified file within a specified branch of a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "The branch to delete the file from",
        },
        filePath: {
          type: "string",
          description: "The path to the file to delete",
        },
        commitMessage: { type: "string", description: "The commit message" },
      },
      required: ["branch", "filePath", "commitMessage"],
    },
  },
  {
    name: "deleteFilesInFolder",
    description:
      "Deletes a specified folder and all its contents within a specified branch of a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "The branch to delete the folder from",
        },
        folderPath: {
          type: "string",
          description: "The path to the folder to delete",
        },
        commitMessage: { type: "string", description: "The commit message" },
      },
      required: ["branch", "folderPath", "commitMessage"],
    },
  },
];

// GithubReader Schemas
export const GithubReaderSchemas: FunctionSchema[] = [
  {
    name: "getRepoFileTree",
    description:
      "Fetches the file and folder structure of a specified branch within a GitHub repository, starting from a specified path or from the root if no path is provided.",
    parameters: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "The branch to fetch the file tree from",
        },
        startPath: {
          type: "string",
          description: "The starting path for listing (optional)",
          default: "",
        },
      },
      required: ["branch"],
    },
  },
  {
    name: "readFile",
    description:
      "Reads the content of a specified file within a specified branch of a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "The branch to read the file from",
        },
        filePath: {
          type: "string",
          description: "The path to the file to read",
        },
      },
      required: ["branch", "filePath"],
    },
  },
];

// BranchManager Schemas
export const BranchManagerSchemas: FunctionSchema[] = [
  {
    name: "createBranch",
    description: "Creates a new branch in the GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        branchName: {
          type: "string",
          description: "The name of the new branch",
        },
        baseBranch: {
          type: "string",
          description: "The base branch to create from",
        },
      },
      required: ["branchName", "baseBranch"],
    },
  },
  {
    name: "updateBranch",
    description: "Updates an existing branch in the GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        branchName: {
          type: "string",
          description: "The name of the branch to update",
        },
        newBase: { type: "string", description: "The new base for the branch" },
      },
      required: ["branchName", "newBase"],
    },
  },
  {
    name: "deleteBranch",
    description: "Deletes a branch from the GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        branchName: {
          type: "string",
          description: "The name of the branch to delete",
        },
      },
      required: ["branchName"],
    },
  },
  {
    name: "listBranches",
    description: "Lists all branches in the specified repository.",
    parameters: {
      type: "object",
      properties: {
        repo: { type: "string", description: "The name of the repository." },
        owner: {
          type: "string",
          description: "The username or organization that owns the repository.",
        },
      },
      required: ["octokit", "repo", "owner"],
    },
  },
];

// IssueManager Schemas
export const IssueManagerSchemas: FunctionSchema[] = [
  {
    name: "createIssue",
    description: "Creates a new issue in a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "The title of the issue" },
        body: { type: "string", description: "The body content of the issue" },
        // labels: { type: "array", description: "Labels to attach to the issue (optional)" },
      },
      required: ["title", "body"],
    },
  },
  {
    name: "updateIssue",
    description: "Updates an existing issue in a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        issueNumber: {
          type: "number",
          description: "The issue number to update",
        },
        title: { type: "string", description: "The new title of the issue" },
        body: {
          type: "string",
          description: "The new body content of the issue",
        },
        // labels: { type: "array", description: "Labels to attach to the issue (optional)" },
      },
      required: ["issueNumber", "title", "body"],
    },
  },
  {
    name: "deleteIssue",
    description: "Closes an existing issue in a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        issueNumber: {
          type: "number",
          description: "The issue number to close",
        },
      },
      required: ["issueNumber"],
    },
  },
  {
    name: "listIssues",
    description: "Lists issues in a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "The state of issues to list (open, closed, all)",
        },
      },
      required: [],
    },
  },
  {
    name: "commentOnIssue",
    description:
      "Posts a comment on a specified issue within a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        issueNumber: {
          type: "integer",
          description: "The number of the issue to comment on",
        },
        commentBody: {
          type: "string",
          description: "The text of the comment to post",
        },
      },
      required: ["issueNumber", "commentBody"],
    },
  },
];

// PullRequestManager Schemas
export const PullRequestManagerSchemas: FunctionSchema[] = [
  {
    name: "createPullRequest",
    description: "Creates a new pull request.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "The title of the pull request" },
        body: {
          type: "string",
          description: "The body content of the pull request",
        },
        head: {
          type: "string",
          description:
            "The name of the branch where your changes are implemented",
        },
        base: {
          type: "string",
          description:
            "The name of the branch you want the changes pulled into",
        },
      },
      required: ["title", "body", "head", "base"],
    },
  },
  {
    name: "updatePullRequest",
    description: "Updates an existing pull request.",
    parameters: {
      type: "object",
      properties: {
        prNumber: {
          type: "number",
          description: "The pull request number to update",
        },
        title: {
          type: "string",
          description: "The new title of the pull request",
        },
        body: {
          type: "string",
          description: "The new body content of the pull request",
        },
      },
      required: ["prNumber", "title", "body"],
    },
  },
  {
    name: "closePullRequest",
    description: "Closes an existing pull request.",
    parameters: {
      type: "object",
      properties: {
        prNumber: {
          type: "number",
          description: "The pull request number to close",
        },
      },
      required: ["prNumber"],
    },
  },
  {
    name: "listPullRequests",
    description: "Lists pull requests.",
    parameters: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "The state of pull requests to list (open, closed, all)",
        },
      },
      required: [],
    },
  },
  {
    name: "addCommentToPullRequest",
    description:
      "Adds a general comment to a pull request. Not suitable for targeted review reply comment",
    parameters: {
      type: "object",
      properties: {
        prNumber: { type: "number", description: "The pull request number" },
        body: { type: "string", description: "The comment body" },
      },
      required: ["prNumber", "body"],
    },
  },
  {
    name: "addLineCommentToPullRequest",
    description:
      "Adds a line comment to a file on a pull request. Suitable for review comments",
    parameters: {
      type: "object",
      properties: {
        prNumber: { type: "number", description: "The pull request number" },
        commitId: { type: "string", description: "The commit ID" },
        body: { type: "string", description: "The comment body" },
        path: { type: "string", description: "The file path" },
        position: {
          type: "number",
          description: "The line position in the diff",
        },
      },
      required: ["prNumber", "commitId", "body", "path", "position"],
    },
  },
  {
    name: "addReplyToPullRequestComment",
    description:
      "Replies to a review comment on a pull request, to be used when replying to users.",
    parameters: {
      type: "object",
      properties: {
        prNumber: { type: "number", description: "The pull request number" },
        commentId: { type: "number", description: "The review comment ID" },
        body: { type: "string", description: "The reply body" },
      },
      required: ["prNumber", "commentId", "body"],
    },
  },
];
