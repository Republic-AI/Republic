const BaseAgent = require('../core/BaseAgent');
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { WebBrowser } = require("langchain/tools");
const { Calculator } = require("langchain/tools");
const { WikipediaQueryRun } = require("langchain/tools");

class LangChainAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.agentName || 'LangChain';
    this.description = config.agentDescription || 'A versatile agent powered by LangChain';
    this.systemPrompt = config.systemPrompt || 'You are a helpful AI assistant.';
    this.tools = this.initializeTools(config.tools || []);
    this.executor = null;
  }

  initializeTools(toolNames) {
    return toolNames.map(name => {
      switch (name) {
        case 'web-search':
          return new WebBrowser();
        case 'calculator':
          return new Calculator();
        case 'wikipedia':
          return new WikipediaQueryRun();
        default:
          return null;
      }
    }).filter(Boolean);
  }

  async initialize() {
    if (!this.executor) {
      this.executor = await initializeAgentExecutorWithOptions(
        this.tools,
        this.model,
        {
          agentType: "chat-conversational-react-description",
          verbose: true,
          memory: this.memory,
          agentArgs: {
            systemMessage: this.systemPrompt,
            humanMessage: `You are ${this.name}. ${this.description}`
          }
        }
      );
    }
    return true;
  }

  async execute(input) {
    await this.initialize();
    
    try {
      const result = await this.executor.call({ input });
      return result.output;
    } catch (error) {
      console.error('Error executing LangChain agent:', error);
      return `Error: ${error.message}`;
    }
  }
}

// Handler function for LangChain agent
const executeLangChainAgent = async (input, config) => {
  const agent = new LangChainAgent(config);
  const result = await agent.execute(input);
  return result;
};

module.exports = {
  LangChainAgent,
  executeLangChainAgent
}; 