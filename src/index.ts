import "dotenv/config";
import chalk from "chalk";
import {
  handlePullRequestsComments,
  handlePullRequests,
} from "./probot/modules/pullRequests";
import { handleIssues } from "./probot/modules/issues";
import { handleInstallation } from "./probot/modules/installations";

export default async (app) => {
  console.log(chalk.bold.green("We're live!"));

  app.onAny(async (context: any) => {
    console.log(
      chalk.bold.bgHex("4361ee")("Event:"),
      chalk.bgWhite(context.name),
      "\n"
    );
  });

  handleInstallation(app)
  handleIssues(app);
  handlePullRequests(app);
  handlePullRequestsComments(app);
};
