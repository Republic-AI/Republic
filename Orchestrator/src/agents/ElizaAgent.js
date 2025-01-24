const { OpenAI } = require('langchain/llms/openai');
const BaseAgent = require('../core/BaseAgent');

// Simple memory management class
class Memory {
  constructor(type = 'conversation') {
    this.type = type;
    this.history = [];
    this.maxHistory = 10;
  }

  async initialize() {
    return true;
  }

  async loadMemoryVariables() {
    return { history: this.history };
  }

  async saveContext(input, output) {
    this.history.push({ input, output });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  async cleanup() {
    this.history = [];
  }
}

// Simple tool management class
class ToolManager {
  constructor() {
    this.tools = new Map();
  }

  async initialize() {
    return true;
  }

  loadTool(tool) {
    this.tools.set(tool.name, tool);
  }

  getTools() {
    return Array.from(this.tools.values());
  }

  async cleanup() {
    this.tools.clear();
  }
}

// Simple client management class
class ClientManager {
  constructor() {
    this.clients = new Map();
  }

  async initialize() {
    return true;
  }

  addClient(platform, config) {
    this.clients.set(platform, {
      platform,
      config,
      post: async (content) => {
        console.log(`[${platform}] Would post: ${content}`);
        return { platform, status: 'simulated', content };
      }
    });
  }

  getClients() {
    return Object.fromEntries(this.clients);
  }

  async cleanup() {
    this.clients.clear();
  }
}

class ElizaAgent extends BaseAgent {
  constructor(config) {
    super(config);
    
    // Core configuration
    this.name = config.agentName || 'Eliza';
    this.description = config.agentDescription || '';
    this.systemPrompt = config.systemPrompt || '';
    this.modelName = config.modelName || 'gpt-4';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 2000;
    
    // Initialize components
    this.memory = new Memory(config.memoryType);
    this.toolManager = new ToolManager();
    this.clientManager = new ClientManager();

    // Initialize social clients if configured
    if (config.socialPlatforms) {
      config.socialPlatforms.forEach(platform => {
        if (config.apiKeys?.[platform]) {
          this.clientManager.addClient(platform, {
            apiKey: config.apiKeys[platform],
            ...config[`${platform}Config`]
          });
        }
      });
    }

    // Load tools
    if (config.tools) {
      config.tools.forEach(tool => {
        this.toolManager.loadTool(tool);
      });
    }
  }

  async initialize() {
    // Initialize LLM
    if (!this.config.apiKeys?.openai) {
      throw new Error('OpenAI API key is required but not provided in configuration');
    }

    this.llm = new OpenAI({
      modelName: this.modelName,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      openAIApiKey: this.config.apiKeys.openai
    });

    // Initialize components
    await this.memory.initialize();
    await this.toolManager.initialize();
    await this.clientManager.initialize();

    // Add default tools
    this.toolManager.loadTool({
      name: 'search',
      description: 'Search the web for information',
      func: async (query) => `Search results for: ${query}`
    });

    this.toolManager.loadTool({
      name: 'calculator',
      description: 'Perform mathematical calculations',
      func: async (expression) => eval(expression).toString()
    });

    return true;
  }

  async execute(input) {
    try {
      await this.initialize();
      
      // Load context from memory
      const context = await this.memory.loadMemoryVariables();
      
      // Construct the prompt
      const prompt = `System: You are ${this.name}, an AI assistant with the following traits:
${this.description}

System Instructions:
${this.systemPrompt}

Previous Context:
${JSON.stringify(context.history)}

Current Input: ${input}

Provide a response that:
1. Aligns with your system instructions
2. Takes into account the conversation history
3. Addresses the current input directly
4. Maintains a consistent personality`;

      // Execute with full context
      const result = await this.llm.call(prompt);
      
      // Store in memory
      await this.memory.saveContext(
        { input },
        { output: result }
      );

      // Post to social platforms if configured
      const socialResults = await Promise.all(
        Object.values(this.clientManager.getClients()).map(client =>
          client.post(result).catch(error => ({
            platform: client.platform,
            error: error.message
          }))
        )
      );

      // Return the result
      return {
        content: result,
        type: 'eliza_response',
        socialResults: socialResults.filter(Boolean),
        context: context
      };

    } catch (error) {
      console.error('Error executing Eliza agent:', error);
      throw error;
    }
  }

  async cleanup() {
    await this.memory.cleanup();
    await this.toolManager.cleanup();
    await this.clientManager.cleanup();
  }
}

// Handler function for Eliza agent
const executeElizaAgent = async (input, config) => {
  const agent = new ElizaAgent(config);
  const result = await agent.execute(input);
  await agent.cleanup();
  return result;
};

module.exports = {
  ElizaAgent,
  executeElizaAgent
}; 