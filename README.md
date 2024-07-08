# Gitagentic

Gitagentic is an intelligent GitHub bot powered by Claude 3, designed to automate and enhance various aspects of repository management and development workflows.

## Motivation

The primary motivation behind Gitagentic is to streamline and automate common tasks in GitHub repositories, reducing manual effort and improving productivity for developers and maintainers. By leveraging the power of AI, Gitagentic aims to provide intelligent assistance in code reviews, issue management, and documentation.

## Features

Gitagentic is a GitHub App that handles the following events:
- Opened issues
- New pull requests
- Comments on pull requests

The bot provides:
- Automated issue handling
- Pull request management and review assistance
- Intelligent code analysis and suggestions
- Documentation generation and maintenance

## Installation

1. Install the Gitagentic GitHub App:
   Visit https://github.com/apps/gitagentic and follow the installation instructions for your repository.

2. Clone the repository:
   ```
   git clone https://github.com/gracelungu/gitagentic.git
   cd gitagentic
   ```

3. Install dependencies:
   ```
   yarn install
   ```

4. Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```
   The `.env.example` file already contains the necessary environment variables. You only need to add the `ANTHROPIC_API_KEY` for Claude 3 AI integration.

5. Build the project:
   ```
   yarn build
   ```

## Usage

To start the Gitagentic bot locally:

```
yarn start
```

For development with hot-reloading:

```
yarn dev
```

### How Gitagentic Works

Gitagentic listens to the following GitHub events:

1. Issue Creation: When a new issue is created, the bot will automatically pick it up and create a corresponding pull request to address the issue.

2. Pull Request Creation: When a new pull request is created, the bot will review it automatically, providing suggestions and comments.

3. Pull Request Review Comments: When a review comment is added to a pull request, the bot can jump in to provide additional comments or even add changes to the pull request.

### Configuration

Gitagentic uses environment variables for configuration. The following variables help configure the bot's behavior:

- `HANDLE_ISSUES`: Set to "yes" to enable the bot to handle issues.
- `BOT_NAME`: The name of the bot (e.g., "gitagentic").
- `WITH_LABEL`: Set to "yes" to make the bot only respond to issues and pull requests with a specific label. The label should match the `BOT_NAME`.
- `HANDLE_PULL_REQUEST`: Set to "yes" to enable the bot to handle pull requests.

Example configuration in your `.env` file:

```
HANDLE_ISSUES=yes
BOT_NAME=gitagentic
WITH_LABEL=no
HANDLE_PULL_REQUEST=yes
```

If `WITH_LABEL` is set to "yes", you need to add a label with the same name as `BOT_NAME` to your GitHub repository. The bot will only interact with issues and pull requests that have this label.

## Project Structure

- `src/index.ts`: Main entry point of the application
- `src/modules/`: Contains various modules for AI and GitHub interactions
- `src/probot/`: Probot-specific modules for handling GitHub events
- `src/modules/ai/claude.ts`: Integration with Claude 3 AI
- `src/modules/github/`: GitHub-related functionality (e.g., BranchManager, IssueManager, PullRequestManager)

## Configuration

Gitagentic uses environment variables for configuration. The `.env.example` file contains the necessary environment variables:

- `GITHUB_APP_ID`: Your GitHub App ID
- `GITHUB_PRIVATE_KEY`: Your GitHub App's private key
- `GITHUB_WEBHOOK_SECRET`: Webhook secret for your GitHub App

You need to add:
- `ANTHROPIC_API_KEY`: API key for Claude 3 AI integration

## Contributing

Contributions to Gitagentic are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Support

For any questions or issues, please open an issue in the GitHub repository or contact the maintainers.

---

Gitagentic is continuously evolving to provide better assistance for GitHub repositories. Stay tuned for updates and new features!