const BaseAgent = require('./BaseAgent');
const { WebBrowser } = require("langchain/tools");
const { Calculator } = require("langchain/tools");
const { WikipediaQueryRun } = require("langchain/tools");

class ElizaAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.agentName || 'Eliza';
    this.description = config.agentDescription || 'A helpful AI assistant';
    this.systemPrompt = config.systemPrompt || 'You are a helpful AI assistant.';
    this.tools = this.initializeTools(config.tools || []);
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

  async execute(input) {
    const context = await this.memory.loadMemoryVariables();
    const prompt = `
System: ${this.systemPrompt}
Name: ${this.name}
Description: ${this.description}
Context: ${JSON.stringify(context.history)}

User: ${input}
`;

    const result = await this.model.call(prompt);
    await this.memory.saveContext({ input }, { output: result });
    return result;
  }
}

module.exports = {
  ElizaAgent
}; 