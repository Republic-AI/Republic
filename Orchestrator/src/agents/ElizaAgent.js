const { BaseAgent } = require('@elizaos/core');
const { RetrievableMemory, DocumentStore } = require('@elizaos/memory');
const { ToolManager, PluginSystem } = require('@elizaos/tools');
const { ClientManager } = require('@elizaos/clients');

class ElizaAgent extends BaseAgent {
  constructor(config) {
    // Initialize with Eliza OS core configuration
    super({
      name: config.agentName,
      description: config.agentDescription,
      systemPrompt: config.systemPrompt,
      model: {
        provider: config.foundationModel?.startsWith('claude') ? 'anthropic' : 'openai',
        name: config.foundationModel,
        apiKey: config.apiKeys?.[config.foundationModel?.startsWith('claude') ? 'anthropic' : 'openai'],
        parameters: config.modelParams
      }
    });

    // Initialize Eliza OS components
    this.memory = new RetrievableMemory({
      documentStore: new DocumentStore(),
      type: config.memoryType || 'conversation'
    });

    this.toolManager = new ToolManager();
    this.pluginSystem = new PluginSystem();
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

    // Load tools and plugins
    if (config.tools) {
      config.tools.forEach(tool => {
        this.toolManager.loadTool(tool);
      });
    }
  }

  async initialize() {
    await super.initialize();
    await this.memory.initialize();
    await this.toolManager.initialize();
    await this.pluginSystem.initialize();
    await this.clientManager.initialize();
    return true;
  }

  async execute(input) {
    try {
      // Initialize if not already done
      if (!this.initialized) {
        await this.initialize();
      }

      // Load context from memory
      const context = await this.memory.retrieve(input);
      
      // Prepare execution context
      const executionContext = {
        input,
        context,
        tools: this.toolManager.getTools(),
        plugins: this.pluginSystem.getPlugins(),
        clients: this.clientManager.getClients()
      };

      // Execute with full context
      const result = await super.execute(executionContext);

      // Store interaction in memory
      await this.memory.store({
        input,
        output: result,
        timestamp: new Date().toISOString()
      });

      // Post to social platforms if configured
      const socialResults = await Promise.all(
        Object.values(this.clientManager.getClients()).map(client =>
          client.post(result).catch(error => ({
            platform: client.platform,
            error: error.message
          }))
        )
      );

      return {
        content: result,
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
    await this.pluginSystem.cleanup();
    await this.clientManager.cleanup();
  }
}

// Handler function for Eliza agent
const executeElizaAgent = async (input, config) => {
  const agent = new ElizaAgent(config);
  try {
    const result = await agent.execute(input);
    return result;
  } finally {
    await agent.cleanup();
  }
};

module.exports = {
  ElizaAgent,
  executeElizaAgent
}; 