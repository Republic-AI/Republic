const { OpenAI } = require("langchain/llms/openai");
const { ChatAnthropic } = require("langchain/chat_models/anthropic");
const { AdvancedMemory } = require("../utils/memory");

class BaseAgent {
  constructor(config = {}) {
    this.config = config;
    this.memory = new AdvancedMemory(config.memoryType);
    
    // Initialize the model based on the foundation model type
    const modelName = config.foundationModel || 'gpt-3.5-turbo';
    
    if (modelName.startsWith('claude')) {
      // Use Anthropic for Claude models
      const anthropicConfig = {
        temperature: config.modelParams?.temperature || 0.7,
        modelName: modelName,
        maxTokens: config.modelParams?.maxTokens || 1000,
        topP: config.modelParams?.topP || 1,
      };

      const anthropicKey = config.apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        throw new Error('Anthropic API key not found in config or environment variables');
      }
      
      anthropicConfig.apiKey = anthropicKey;
      this.model = new ChatAnthropic(anthropicConfig);
    } else {
      // Use OpenAI for GPT models
      const openAIConfig = {
        temperature: config.modelParams?.temperature || 0.7,
        modelName: modelName === 'openai' ? 'gpt-3.5-turbo' : modelName,
        maxTokens: config.modelParams?.maxTokens || 1000,
        topP: config.modelParams?.topP || 1,
      };

      const openAIKey = config.apiKeys?.openai || process.env.OPENAI_API_KEY;
      if (!openAIKey) {
        throw new Error('OpenAI API key not found in config or environment variables');
      }
      
      openAIConfig.openAIApiKey = openAIKey;
      this.model = new OpenAI(openAIConfig);
    }
  }

  async initialize() {
    return true;
  }

  async execute(input) {
    throw new Error('Execute method must be implemented');
  }
}

module.exports = BaseAgent; 