import axios from "axios";
import "dotenv/config";
import { Octokit } from "@octokit/rest";
import chalk from "chalk";

type ManagerOptions = {
  octokit: Octokit;
  repo: string;
  owner: string;
};

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

type FunctionsArray = FunctionSchema[];

class Claude {
  private apiKey: string;
  private model: string;

  constructor(
    apiKey: string = process.env.CLAUDE_API_KEY || "",
    model: string = "claude-3-5-sonnet-20240620"
  ) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async createChatCompletion(
    messages: Array<{ role: string; content: string }>,
    functions: FunctionsArray,
    system: string
  ) {
    try {
      console.log(chalk.bold.yellow("🤔 Thinking...\n\n"));
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: this.model,
          messages,
          system,
          tools: functions.map((func) => ({
            name: func.name,
            description: func.description,
            input_schema: func.parameters,
          })),
          tool_choice: { type: "auto" },
          temperature: 0.4,
          max_tokens: 4000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
          },
        }
      );

      const { content } = response.data;
      const tools = content.filter((tool) => {
        if (tool.type === "tool_use") return tool;
      });

      if (tools.length > 0) {
        console.log(
          chalk.bold.cyan("👾 Calling function: "),
          chalk.bgMagentaBright(
            tools.reduce((acc, tool) => acc + tool.name, "")
          ),
          "\n"
        );
        return { content, tools };
      } else {
        console.log(chalk.bold.bgWhite("✅ Task completed with:\n\n"));
        return { content: content[0].text };
      }
    } catch (error: any) {
      console.log({ error });
      if (error?.response) {
        console.log(error.response?.status);
        console.log(error.response?.headers);
        console.log(error.response?.data);
      }
    }
  }

  async recursiveClaudeCall(
    managerOptions: ManagerOptions,
    manager: any,
    messages: any[],
    functions: any[],
    system: string
  ) {
    const response = await this.createChatCompletion(
      messages,
      functions,
      system
    );

    if (response && response.tools) {
      messages.push({
        role: "assistant",
        content: response.content,
      });

      const content: any = [];

      for (let tool of response.tools) {
        if (manager[tool.name]) {
          const result = await manager[tool.name](managerOptions, ...Object.values(tool.input));

          content.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: JSON.stringify(result),
          });
        }
      }
      messages.push({ role: "user", content });

      await this.recursiveClaudeCall(
        managerOptions,
        manager,
        messages,
        functions,
        system
      );
    } else if (response && response.content) {
      messages.push({
        role: "assistant",
        content: response.content,
      });
    }
  }
}

export default Claude;
