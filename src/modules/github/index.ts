import * as BranchManager from "./BranchManager";
import * as GithubReader from "./GithubReader";
import * as GithubWriter from "./GithubWriter";
import * as IssueManager from "./IssueManager";
import * as PullRequestManager from "./PullRequestManager";

const GithubAPI = {
  ...BranchManager,
  ...GithubReader,
  ...GithubWriter,
  ...IssueManager,
  ...PullRequestManager,
};

export default GithubAPI;
