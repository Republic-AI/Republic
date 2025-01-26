const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { OpenAI } = require("langchain/llms/openai");
const { ChatAnthropic } = require("langchain/chat_models/anthropic");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { Calculator } = require("langchain/tools");
const { WikipediaQueryRun } = require("langchain/tools");
const { BufferMemory, ConversationSummaryMemory } = require("langchain/memory");
const { WebSearchTool, DocumentTool, CodeExecutionTool, FileOperationsTool } = require("langchain/tools");
const { 
  EchochambersClient,
  BlockchainClient,
  GoatPluginManager 
} = require("langchain/tools");
const { DuckDuckGoSearchRun } = require("langchain/tools");
const { SerpAPI } = require("langchain/tools");
const { DocumentStore } = require("./utils/DocumentStore");
require("dotenv").config();

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());

/**
 * 前端会发送一个 "graph" 对象，包含节点列表和连线。
 * 每个节点有: { id, type, inputText, ... }，也有 edges 列表指示节点间的连接。
 *
 * Example graph (simplified):
 * {
 *   "nodes": [
 *     { "id": "1", "type": "python-llm", "inputText": "Hello, Python LLM" },
 *     { "id": "2", "type": "node-llm", "inputText": "We got: {PREV_RESULT}" }
 *   ],
 *   "edges": [
 *     { "source": "1", "target": "2" }
 *   ]
 * }
 *
 * We'll do a simple topological run:
 * 1. Find nodes with no incoming edge => start nodes
 * 2. Execute them => store output
 * 3. Pass output to connected nodes => replace {PREV_RESULT} placeholders
 * 4. Execute next => ...
 * (For simplicity, we'll assume there's no complex branching in this minimal demo.)
 */

// Memory instances cache
const memoryInstances = {};

// Memory System
class AdvancedMemory {
  constructor(type = 'buffer') {
    this.type = type;
    this.memory = type === 'conversation' 
      ? new ConversationSummaryMemory({ llm: new OpenAI({ temperature: 0 }) })
      : new BufferMemory();
    this.history = [];
  }

  async saveContext(inputValues, outputValues) {
    this.history.push({ input: inputValues, output: outputValues, timestamp: new Date() });
    return this.memory.saveContext(inputValues, outputValues);
  }

  async loadMemoryVariables() {
    const vars = await this.memory.loadMemoryVariables();
    return {
      ...vars,
      history: this.history
    };
  }

  async clear() {
    this.history = [];
    return this.memory.clear();
  }
}

// Social Platform Integration
class SocialPlatform {
  constructor(config = {}) {
    this.config = config;
    this.initialized = false;
    this.axios = axios.create({
      timeout: 10000,
      headers: { 'User-Agent': 'Republic/1.0' }
    });
  }

  async initialize() {
    if (!this.config.token) {
      throw new Error('API token is required');
    }
    this.initialized = true;
    return true;
  }

  async post(content) {
    throw new Error('Post method must be implemented');
  }

  async validateContent(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }
    return true;
  }
}

class TwitterPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.apiBase = 'https://api.twitter.com/2';
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${config.token}`;
  }

  async initialize() {
    await super.initialize();
    try {
      // Verify credentials
      const response = await this.axios.get(`${this.apiBase}/users/me`);
      this.userId = response.data.data.id;
      return true;
    } catch (error) {
      throw new Error(`Twitter authentication failed: ${error.message}`);
    }
  }

  async post(content) {
    await this.validateContent(content);
    if (!this.initialized) await this.initialize();

    try {
      const response = await this.axios.post(`${this.apiBase}/tweets`, {
        text: content.slice(0, 280) // Twitter's character limit
      });

      return {
        platform: 'twitter',
        success: true,
        tweetId: response.data.data.id,
        url: `https://twitter.com/i/web/status/${response.data.data.id}`
      };
    } catch (error) {
      console.error('Twitter API error:', error.response?.data || error.message);
      throw new Error(`Failed to post to Twitter: ${error.message}`);
    }
  }
}

class FarcasterPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.apiBase = 'https://api.farcaster.xyz/v1';
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${config.token}`;
  }

  async initialize() {
    await super.initialize();
    try {
      // Verify connection
      const response = await this.axios.get(`${this.apiBase}/me`);
      this.fid = response.data.fid;
      return true;
    } catch (error) {
      throw new Error(`Farcaster authentication failed: ${error.message}`);
    }
  }

  async post(content) {
    await this.validateContent(content);
    if (!this.initialized) await this.initialize();

    try {
      const response = await this.axios.post(`${this.apiBase}/casts`, {
        text: content.slice(0, 320), // Farcaster's character limit
        parent: null,
        mentions: [],
        embeds: []
      });

      return {
        platform: 'farcaster',
        success: true,
        castHash: response.data.hash,
        url: `https://warpcast.com/${this.username}/${response.data.hash}`
      };
    } catch (error) {
      console.error('Farcaster API error:', error.response?.data || error.message);
      throw new Error(`Failed to post to Farcaster: ${error.message}`);
    }
  }
}

class DiscordPlatform extends SocialPlatform {
  constructor(config) {
    super(config);
    this.apiBase = 'https://discord.com/api/v10';
    this.axios.defaults.headers.common['Authorization'] = `Bot ${config.token}`;
    this.channels = config.channels || [];
  }

  async initialize() {
    await super.initialize();
    try {
      // Verify bot connection
      const response = await this.axios.get(`${this.apiBase}/users/@me`);
      this.botId = response.data.id;
      return true;
    } catch (error) {
      throw new Error(`Discord authentication failed: ${error.message}`);
    }
  }

  async post(content, options = {}) {
    await this.validateContent(content);
    if (!this.initialized) await this.initialize();

    const results = [];
    const channels = options.channels || this.channels;

    if (!channels.length) {
      throw new Error('No Discord channels specified');
    }

    for (const channelId of channels) {
      try {
        const response = await this.axios.post(`${this.apiBase}/channels/${channelId}/messages`, {
          content: content,
          embeds: options.embeds || [],
          components: options.components || []
        });

        results.push({
          platform: 'discord',
          success: true,
          channelId: channelId,
          messageId: response.data.id,
          url: `https://discord.com/channels/${response.data.guild_id}/${channelId}/${response.data.id}`
        });
      } catch (error) {
        console.error(`Discord API error for channel ${channelId}:`, error.response?.data || error.message);
        results.push({
          platform: 'discord',
          success: false,
          channelId: channelId,
          error: error.message
        });
      }
    }

    return results;
  }

  async createThread(channelId, name, content) {
    if (!this.initialized) await this.initialize();

    try {
      const response = await this.axios.post(`${this.apiBase}/channels/${channelId}/threads`, {
        name: name,
        type: 11, // Public thread
        auto_archive_duration: 1440 // 24 hours
      });

      // Post initial message in thread
      await this.axios.post(`${this.apiBase}/channels/${response.data.id}/messages`, {
        content: content
      });

      return {
        platform: 'discord',
        success: true,
        threadId: response.data.id,
        url: `https://discord.com/channels/${response.data.guild_id}/${channelId}/${response.data.id}`
      };
    } catch (error) {
      console.error('Discord API error:', error.response?.data || error.message);
      throw new Error(`Failed to create Discord thread: ${error.message}`);
    }
  }
}

// Base Agent Class
class BaseAgent {
  constructor(config = {}) {
    this.config = config;
    this.memory = new AdvancedMemory(config.memoryConfig?.memoryType);
    
    // Initialize the model based on the foundation model type
    const modelName = config.foundationModel || 'gpt-3.5-turbo';
    
    // Log the config structure to debug
    console.log('BaseAgent config:', JSON.stringify(config, null, 2));
    
    // Try to get API key from different possible locations
    const apiKey = config.modelConfig?.apiKey || config.apiKey || process.env.OPENAI_API_KEY;
    
    console.log('Found API key:', apiKey ? 'Yes' : 'No');
    
    if (!apiKey) {
      throw new Error(`API key not found for model ${modelName}. Please provide it in the node configuration.`);
    }

    if (modelName.startsWith('claude')) {
      // Use Anthropic for Claude models
      const anthropicConfig = {
        temperature: config.modelParams?.temperature || 0.7,
        modelName: modelName,
        maxTokens: config.modelParams?.maxTokens || 1000,
        topP: config.modelParams?.topP || 1,
        apiKey: apiKey
      };
      
      this.model = new ChatAnthropic(anthropicConfig);
    } else {
      // Use OpenAI for GPT models
      const openAIConfig = {
        temperature: config.modelParams?.temperature || 0.7,
        modelName: modelName === 'openai' ? 'gpt-3.5-turbo' : modelName,
        maxTokens: config.modelParams?.maxTokens || 1000,
        topP: config.modelParams?.topP || 1,
        openAIApiKey: apiKey
      };
      
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

// Eliza Agent Implementation
class ElizaAgent extends BaseAgent {
  constructor(config) {
    super(config);
    // Core agent properties
    this.name = config.agentName || 'Eliza';
    this.role = config.agentRole || 'empathetic';
    this.conversationStyle = config.conversationStyle || 'empathetic';
    this.reflectionLevel = config.reflectionLevel || 7;
    
    // Social platform integrations
    this.socialPlatforms = this.initializeSocialPlatforms(config.socialPlatforms || {});
    
    // Document store and memory
    this.documentStore = new DocumentStore(config.documentStoreConfig || {});
    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output"
    });

    // Pattern matching and response generation
    this.patterns = this.loadPatterns();
    this.responseGenerators = this.initializeResponseGenerators();
    
    // Multi-agent support
    this.collaborators = new Map();
    if (config.collaborators) {
      for (const [id, agentConfig] of Object.entries(config.collaborators)) {
        this.collaborators.set(id, new ElizaAgent(agentConfig));
      }
    }
  }

  initializeSocialPlatforms(config) {
    const platforms = {};
    
    // Twitter/X integration
    if (config.twitter?.enabled) {
      platforms.twitter = new TwitterPlatform({
        apiKey: config.twitter.apiKey,
        autoPost: config.twitter.autoPost
      });
    }

    // Discord integration
    if (config.discord?.enabled) {
      platforms.discord = new DiscordPlatform({
        botToken: config.discord.botToken,
        channels: config.discord.channels,
        autoPost: config.discord.autoPost
      });
    }

    // Telegram integration
    if (config.telegram?.enabled) {
      platforms.telegram = new TelegramPlatform({
        botToken: config.telegram.botToken,
        channels: config.telegram.channels,
        autoPost: config.telegram.autoPost
      });
    }

    return platforms;
  }

  loadPatterns() {
    return {
      greeting: [
        { pattern: /hello|hi|hey/i, response: `Hello, I'm ${this.name}. How can I help you today?` },
        { pattern: /how are you/i, response: "I'm here to assist you. What would you like to discuss?" }
      ],
      reflection: [
        { pattern: /i am (.*)/i, response: "Tell me more about being $1." },
        { pattern: /i feel (.*)/i, response: "What makes you feel $1?" },
        { pattern: /i think (.*)/i, response: "What leads you to think $1?" }
      ],
      deepening: [
        { pattern: /because (.*)/i, response: "How did you come to that conclusion about $1?" },
        { pattern: /but (.*)/i, response: "What other aspects of $1 would you like to explore?" }
      ],
      emotions: [
        { pattern: /(sad|angry|happy|anxious|worried)/i, response: "How does being $1 affect you?" },
        { pattern: /afraid|scared/i, response: "What aspects of this situation concern you?" }
      ],
      documents: [
        { pattern: /read|document|file/i, response: "I'll help you analyze that document. What aspects should we focus on?" }
      ]
    };
  }

  initializeResponseGenerators() {
    return {
      reflection: this.generateReflection.bind(this),
      analysis: this.generateAnalysis.bind(this),
      summary: this.generateSummary.bind(this),
      action: this.generateActionPlan.bind(this)
    };
  }

  async generateAnalysis(input, context) {
    const prompt = `
      Analyze the following input in the context of our therapeutic conversation:
      Input: ${input}
      Context: ${context}
      
      Provide a structured analysis focusing on:
      1. Emotional content
      2. Core beliefs
      3. Behavioral patterns
      4. Potential areas for exploration
    `;
    return await this.model.call(prompt);
  }

  async generateSummary(conversation) {
    const prompt = `
      Summarize the key points of our therapeutic conversation:
      ${conversation}
      
      Focus on:
      1. Main themes
      2. Emotional progress
      3. Insights gained
      4. Areas for future exploration
    `;
    return await this.model.call(prompt);
  }

  async generateActionPlan(insights) {
    const prompt = `
      Based on these therapeutic insights:
      ${insights}
      
      Create a gentle, non-prescriptive action plan that:
      1. Encourages self-reflection
      2. Supports emotional awareness
      3. Promotes healthy coping strategies
      4. Maintains therapeutic boundaries
    `;
    return await this.model.call(prompt);
  }

  async processDocument(document) {
    await this.documentStore.add(document);
    const analysis = await this.generateAnalysis(document.content, "document review");
    return {
      analysis,
      metadata: document.metadata
    };
  }

  async broadcastToSocialPlatforms(response) {
    const results = {};
    for (const [platform, client] of Object.entries(this.socialPlatforms)) {
      if (client.autoPost) {
        try {
          results[platform] = await client.post(response);
        } catch (error) {
          console.error(`Error posting to ${platform}:`, error);
          results[platform] = { error: error.message };
        }
      }
    }
    return results;
  }

  async execute(input) {
    try {
      // Load conversation history
      const context = await this.memory.loadMemoryVariables({});
      const history = context.chat_history || [];

      // Try pattern matching first
      let response = await this.matchPattern(input);

      // If no pattern match, use the LLM with proper context
      if (!response) {
        const prompt = `
Role: You are ${this.name}, a conversational AI with a ${this.role} approach and ${this.conversationStyle} conversation style.
Context: Previous conversation history:
${history.map(h => `${h.type}: ${h.content}`).join('\n')}

Current input: ${input}

Instructions:
1. Maintain a reflection level of ${this.reflectionLevel}/10
2. Use active listening techniques
3. Focus on understanding and responding to the user's perspective
4. Provide thoughtful, relevant responses
5. Use open-ended questions
6. Stay within your configured role

Response:`;

        response = await this.model.call(prompt);
      }

      // Generate additional insights
      const analysis = await this.generateAnalysis(input, history);
      
      // Save the interaction to memory
      await this.memory.saveContext(
        { input: input },
        { output: response }
      );

      // Broadcast to social platforms if configured
      const socialResults = await this.broadcastToSocialPlatforms(response);

      // Return comprehensive response
      return {
        content: response,
        metadata: {
          agentName: this.name,
          role: this.role,
          style: this.conversationStyle,
          timestamp: new Date().toISOString(),
          analysis: analysis,
          socialPlatforms: socialResults
        }
      };
    } catch (error) {
      console.error('Error in Eliza execution:', error);
      throw new Error(`Eliza execution failed: ${error.message}`);
    }
  }
}

// ZerePy Agent Implementation
class ZerePyAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.agentName || 'ZerePy';
    this.bio = config.agentBio || 'Social media management agent';
    this.traits = config.traits || ['engaging', 'analytical'];
    this.taskWeights = config.taskWeights || {
      contentCreation: 0.4,
      engagement: 0.3,
      analysis: 0.3
    };
  }

  async execute(input) {
    const context = await this.memory.loadMemoryVariables();
    
    // Generate content
    const prompt = `
System: You are ${this.name}, a social media management AI with the following traits: ${this.traits.join(', ')}.
Bio: ${this.bio}
Task: Create engaging social media content based on the following input.

Context: ${JSON.stringify(context.history)}
Input: ${input}

Generate a response that maintains a consistent message while being engaging and concise.
`;

    const result = await this.model.call(prompt);
    await this.memory.saveContext({ input }, { output: result });
    
    return result;
  }
}

// AutoGPT Agent Implementation
class AutoGPTAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.maxIterations = config.maxIterations || 5;
    this.tools = this.initializeTools(config.tools || []);
    this.goals = config.goals || [];
  }

  initializeTools(toolNames) {
    return toolNames.map(name => {
      switch (name) {
        case 'search':
          return DuckDuckGo();
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
    const goals = [...this.goals, input];
    let iteration = 0;
    const results = [];

    while (iteration < this.maxIterations) {
      const context = await this.memory.loadMemoryVariables();
      
      const prompt = `
System: You are an autonomous agent working to achieve the following goals:
${goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Current Iteration: ${iteration + 1}/${this.maxIterations}
Available Tools: ${this.tools.map(t => t.name).join(', ')}
Previous Actions: ${JSON.stringify(context.history)}

Determine the next action to take. Respond in JSON format with:
{
  "thought": "your reasoning process",
  "action": "the tool to use or 'complete' if goals are achieved",
  "input": "input for the tool"
}
`;

      const response = await this.model.call(prompt);
      let actionResult;

      try {
        const decision = JSON.parse(response);
        
        if (decision.action === 'complete') {
          break;
        }

        const tool = this.tools.find(t => t.name === decision.action);
        if (tool) {
          actionResult = await tool.call(decision.input);
        } else {
          actionResult = `No tool found for action: ${decision.action}`;
        }

        results.push({
          iteration: iteration + 1,
          thought: decision.thought,
          action: decision.action,
          result: actionResult
        });

        await this.memory.saveContext(
          { thought: decision.thought, action: decision.action },
          { result: actionResult }
        );

      } catch (error) {
        console.error('Error in AutoGPT iteration:', error);
        results.push({
          iteration: iteration + 1,
          error: error.message
        });
      }

      iteration++;
    }

    return JSON.stringify(results, null, 2);
  }
}

// BabyAGI Agent Implementation
class BabyAGIAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.maxTasks = config.maxTasks || 5;
    this.tools = this.initializeTools(config.tools || []);
    this.taskList = [];
  }

  initializeTools(toolNames) {
    return toolNames.map(name => {
      switch (name) {
        case 'search':
          return DuckDuckGo();
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
    // Initialize with the main objective
    this.taskList = [{
      id: 1,
      task: input,
      status: 'pending',
      dependencies: []
    }];

    const results = [];
    let completedTasks = 0;

    while (completedTasks < this.maxTasks && this.taskList.length > 0) {
      const currentTask = this.taskList.find(t => t.status === 'pending');
      if (!currentTask) break;

      const context = await this.memory.loadMemoryVariables();
      
      const prompt = `
System: You are a task execution and management AI.
Current Task: ${currentTask.task}
Completed Tasks: ${JSON.stringify(context.history)}
Available Tools: ${this.tools.map(t => t.name).join(', ')}

Execute the current task and suggest new tasks based on the result.
Respond in JSON format with:
{
  "execution": {
    "thought": "your reasoning process",
    "action": "the tool to use",
    "input": "input for the tool"
  },
  "newTasks": [
    "list of new tasks identified"
  ]
}
`;

      try {
        const response = await this.model.call(prompt);
        const decision = JSON.parse(response);
        
        // Execute current task
        let executionResult;
        const tool = this.tools.find(t => t.name === decision.execution.action);
        if (tool) {
          executionResult = await tool.call(decision.execution.input);
        } else {
          executionResult = `No tool found for action: ${decision.execution.action}`;
        }

        // Add new tasks
        decision.newTasks.forEach((task, index) => {
          this.taskList.push({
            id: this.taskList.length + index + 1,
            task: task,
            status: 'pending',
            dependencies: [currentTask.id]
          });
        });

        // Update current task status
        currentTask.status = 'completed';
        completedTasks++;

        // Save results
        results.push({
          taskId: currentTask.id,
          task: currentTask.task,
          execution: {
            thought: decision.execution.thought,
            action: decision.execution.action,
            result: executionResult
          },
          newTasks: decision.newTasks
        });

        await this.memory.saveContext(
          { task: currentTask.task },
          { result: executionResult, newTasks: decision.newTasks }
        );

      } catch (error) {
        console.error('Error in BabyAGI task execution:', error);
        currentTask.status = 'failed';
        results.push({
          taskId: currentTask.id,
          task: currentTask.task,
          error: error.message
        });
      }
    }

    return JSON.stringify(results, null, 2);
  }
}

// Tool definitions and requirements
const AVAILABLE_TOOLS = {
  'search': {
    name: 'Web Search',
    types: ['duckduckgo', 'serpapi'],
    requiresConfig: {
      serpapi: ['apiKey']
    },
    initialize: (config) => {
      if (config.type === 'serpapi') {
        const { SerpAPI } = require("langchain/tools");
        return new SerpAPI(config.apiKey);
      } else {
        // Fallback to DuckDuckGo if no API key
        const { WebBrowser } = require("langchain/tools");
        return new WebBrowser();
      }
    }
  },
  'calculator': {
    name: 'Calculator',
    initialize: () => new Calculator()
  },
  'wikipedia': {
    name: 'Wikipedia',
    initialize: () => new WikipediaQueryRun()
  }
};

// Initialize tools based on configuration
function initializeTools(config = {}) {
  const tools = [];
  
  if (config.tools?.includes('search')) {
    tools.push(new DuckDuckGoSearchRun());
  }
  
  if (config.tools?.includes('wikipedia')) {
    tools.push(new WikipediaQueryRun());
  }
  
  if (config.tools?.includes('calculator')) {
    tools.push(new Calculator());
  }
  
  return tools;
}

// Initialize memory based on configuration
const initializeMemory = (nodeId, memoryType) => {
  if (!memoryInstances[nodeId]) {
    memoryInstances[nodeId] = new AdvancedMemory(memoryType);
  }
  return memoryInstances[nodeId];
};

// Handle LangChain agent execution
const executeLangChainAgent = async (input, config) => {
  const tools = initializeTools(config.toolsConfig || {});
  
  // Initialize memory with chat history support
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output"
  });
  
  // Get API key from modelConfig
  const apiKey = config.modelConfig?.apiKey;
  if (!apiKey) {
    throw new Error(`API key not found. Please provide it in the node configuration.`);
  }
  
  // Initialize OpenAI model with configuration
  const model = new OpenAI({ 
    temperature: config.modelConfig?.modelParams?.temperature || 0.7,
    openAIApiKey: apiKey,
    modelName: config.modelConfig?.foundationModel || 'gpt-3.5-turbo'
  });

  // Initialize agent with correct type and memory
  const executor = await initializeAgentExecutorWithOptions(
    tools,
    model,
    {
      agentType: "chat-conversational-react-description",
      memory: memory,
      verbose: true,
      maxIterations: config.maxIterations || 3,
      earlyStoppingMethod: "generate",
      handleParsingErrors: true
    }
  );

  try {
    // Initialize chat history if needed
    await memory.saveContext(
      { input: "Hello, I'm ready to help you." },
      { output: "Hello! I'm here to assist. What can I help you with?" }
    );
    
    const result = await executor.call({ input });
    return result.output;
  } catch (error) {
    console.error('Error in LangChain agent execution:', error);
    throw new Error(`LangChain agent execution failed: ${error.message}`);
  }
};

// Handle AutoGPT agent execution
const executeAutoGPTAgent = async (input, config) => {
  // Implementation for AutoGPT
  const tools = initializeTools(config.toolsConfig || {});
  const maxIterations = config.maxIterations || 5;
  
  let result = `[AutoGPT] Processing task: ${input}\n`;
  // Add AutoGPT-specific implementation here
  return result;
};

// Handle BabyAGI agent execution
const executeBabyAGIAgent = async (input, config) => {
  // Implementation for BabyAGI
  const maxTasks = config.maxTasks || 5;
  const objective = config.objective || input;
  
  let result = `[BabyAGI] Working on objective: ${objective}\n`;
  // Add BabyAGI-specific implementation here
  return result;
};

// Handle ZerePy agent execution
const executeZerePyAgent = async (input, config) => {
  try {
    // Initialize platform instances
    const socialPlatforms = {
      twitter: config.apiKeys?.twitter ? new TwitterPlatform({ token: config.apiKeys.twitter }) : null,
      farcaster: config.apiKeys?.farcaster ? new FarcasterPlatform({ token: config.apiKeys.farcaster }) : null,
      discord: config.apiKeys?.discord ? new DiscordPlatform({ token: config.apiKeys.discord }) : null,
    };

    // Create the agent instance
    const agent = new ZerePyAgent(config);
    
    // Process input through the agent
    const agentResult = await agent.execute(input);
    
    // Format the result
    let result = {
      content: agentResult,  // This will be processed by extractAgentResult
      socialPosts: []
    };

    // Post to social platforms if configured
    if (config.socialPlatforms) {
      for (const platform of config.socialPlatforms) {
        const client = socialPlatforms[platform];
        if (client) {
          try {
            const postResult = await client.post(agentResult);
            result.socialPosts.push({
              platform,
              success: true,
              ...postResult
            });
          } catch (error) {
            console.error(`Error posting to ${platform}:`, error);
            result.socialPosts.push({
              platform,
              success: false,
              error: error.message
            });
          }
        }
      }
    }

    // Return only the content for consistent handling
    return result.content;
  } catch (error) {
    console.error('Error executing ZerePy agent:', error);
    return `Error: ${error.message}`;
  }
};

// Helper function to get model provider
const getModelProvider = (model) => {
  if (model.startsWith('gpt')) return 'openai';
  if (model.startsWith('claude')) return 'anthropic';
  if (model === 'gemini') return 'google';
  return 'openai'; // default
};

// Handle input node execution
const executeInputNode = async (input, config) => {
  try {
    let result;
    switch (config.inputType) {
      case 'text':
        result = input;
        break;

      case 'file':
        // Files are handled by the frontend and passed as base64
        result = config.fileUpload;
        break;

      case 'api':
        const response = await axios({
          method: config.apiMethod,
          url: config.apiEndpoint,
          headers: JSON.parse(config.apiHeaders || '{}'),
          data: JSON.parse(config.apiBody || '{}')
        });
        result = JSON.stringify(response.data);
        break;

      default:
        result = input;
    }
    return result;
  } catch (error) {
    console.error('Error executing input node:', error);
    return `Error: ${error.message}`;
  }
};

// Update the output node execution to better handle results
const executeOutputNode = async (input, config) => {
  try {
    // If input is an array of results from multiple nodes
    if (Array.isArray(input)) {
      const formattedResults = input.map(item => {
        if (typeof item === 'string' && item.includes('Results from')) {
          return item; // Already formatted
        }
        return typeof item === 'object' ? 
          extractAgentResult(item) : 
          String(item);
      });
      return formattedResults.join('\n\n');
    }
    
    // Handle single input
    return typeof input === 'object' ? 
      extractAgentResult(input) : 
      String(input);
  } catch (error) {
    console.error('Error executing output node:', error);
    return `Error: ${error.message}`;
  }
};

// Agent handlers mapping
const agentHandlers = {
  'input': async (input, config) => {
    return input;
  },
  'output': async (input, config) => {
    return await executeOutputNode(input, config);
  },
  'eliza': async (input, config) => {
    console.log('Eliza handler config:', JSON.stringify(config, null, 2));
    
    const elizaConfig = {
      foundationModel: config.modelConfig?.foundationModel || 'gpt-3.5-turbo',
      modelConfig: {
        apiKey: config.apiKey
      },
      apiKey: config.apiKey,  // Also pass directly
      modelParams: config.modelConfig?.modelParams || {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1
      },
      agentName: config.agentName,
      agentRole: config.agentRole,
      conversationStyle: config.conversationStyle,
      reflectionLevel: config.reflectionLevel,
      socialPlatforms: config.socialPlatforms,
      documentStoreConfig: config.documentStoreConfig
    };

    console.log('Eliza config prepared:', JSON.stringify(elizaConfig, null, 2));

    const agent = new ElizaAgent(elizaConfig);
    const result = await agent.execute(input);
    return extractAgentResult(result);
  },
  'zerepy': async (input, config) => {
    const zerepyConfig = {
      foundationModel: config.modelConfig?.foundationModel || 'gpt-3.5-turbo',
      apiKey: config?.apiKey,  // Get API key from modelConfig
      modelParams: config.modelConfig?.modelParams || {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1
      },
      agentName: config.agentName,
      agentBio: config.agentBio,
      traits: config.traits,
      taskWeights: config.taskWeights
    };

    const agent = new ZerePyAgent(zerepyConfig);
    const result = await agent.execute(input);
    return extractAgentResult(result);
  },
  'autogpt': async (input, config) => {
    const autogptConfig = {
      foundationModel: config.modelConfig?.foundationModel || 'gpt-4',
      apiKey: config.modelConfig?.apiKey,  // Get API key from modelConfig
      modelParams: config.modelConfig?.modelParams || {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1
      },
      maxIterations: config.maxIterations,
      tools: config.tools
    };

    const agent = new AutoGPTAgent(autogptConfig);
    const result = await agent.execute(input);
    return extractAgentResult(result);
  },
  'babyagi': async (input, config) => {
    const babyagiConfig = {
      foundationModel: config.modelConfig?.foundationModel || 'gpt-4',
      apiKey: config.modelConfig?.apiKey,  // Get API key from modelConfig
      modelParams: config.modelConfig?.modelParams || {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1
      },
      maxTasks: config.maxTasks,
      tools: config.tools
    };

    const agent = new BabyAGIAgent(babyagiConfig);
    const result = await agent.execute(input);
    return extractAgentResult(result);
  },
  'langchain': async (input, config) => {
    const langchainConfig = {
      modelConfig: {
        foundationModel: config.modelConfig?.foundationModel || 'gpt-3.5-turbo',
        apiKey: config.modelConfig?.apiKey,  // Get API key from modelConfig
        modelParams: config.modelConfig?.modelParams || {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1
        }
      },
      toolsConfig: config.toolsConfig,
      maxIterations: config.maxIterations || 3
    };

    return await executeLangChainAgent(input, langchainConfig);
  }
};

// Helper function to extract the actual result content from agent outputs
function extractAgentResult(result) {
  // If result is already a string, return it
  if (typeof result === 'string') {
    return result;
  }
  
  // If result is null or undefined, return empty string
  if (!result) {
    return '';
  }

  try {
    // If result is a string that looks like JSON, parse it
    if (typeof result === 'string' && (result.startsWith('{') || result.startsWith('['))) {
      result = JSON.parse(result);
    }

    // If result is an object
    if (typeof result === 'object') {
      // If it has a content/output property, use that
      if (result.content) return result.content;
      if (result.output) return result.output;
      if (result.result) return result.result;
      if (result.response) return result.response;
      if (result.text) return result.text;
      if (result.message) return result.message;
      
      // If it's an array, join the elements
      if (Array.isArray(result)) {
        return result.map(item => 
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        ).join('\n');
      }

      // If it has only one key, use its value
      const keys = Object.keys(result);
      if (keys.length === 1) {
        return extractAgentResult(result[keys[0]]);
      }

      // If it has multiple keys and none of them are our expected output keys,
      // stringify the entire object
      return JSON.stringify(result, null, 2);
    }
  } catch (error) {
    console.error('Error extracting result:', error);
    return String(result);
  }

  // For any other type, convert to string
  return String(result);
}

app.post('/execute-flow', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    console.log('Received request with nodes:', JSON.stringify(nodes, null, 2));
    
    // Initialize tracking
    const nodeResults = {};
    const inDegree = {};
    const processingOrder = [];
    
    // Calculate in-degrees
    nodes.forEach(n => {
      inDegree[n.id] = 0;
    });
    edges.forEach(e => {
      inDegree[e.target]++;
    });
    
    // Start with nodes that have no incoming edges
    const queue = nodes.filter(n => inDegree[n.id] === 0);
    console.log('Starting nodes:', queue.map(n => n.id));

    // Process nodes in topological order
    while (queue.length > 0) {
      const current = queue.shift();
      const nodeId = current.id;
      console.log(`Processing node ${nodeId}`);

      try {
        // Get input for current node
        let inputString = current.inputText || "";
        const incomingEdges = edges.filter(e => e.target === nodeId);
        
        // Collect inputs from previous nodes
        if (incomingEdges.length > 0) {
          const inputs = [];
          for (const edge of incomingEdges) {
            const sourceResult = nodeResults[edge.source];
            if (sourceResult) {
              // Extract content from result object
              const content = sourceResult.content || extractAgentResult(sourceResult);
              inputs.push(content);
            }
          }
          inputString = inputs.join('\n\n');
        }

        console.log(`Node ${nodeId} input:`, inputString);

        // Get node type and config, checking both direct properties and data object
        const nodeType = current.type || (current.data && current.data.type);
        const nodeConfig = current.config || (current.data && current.data.config) || {};

        if (!nodeType) {
          throw new Error(`Node ${nodeId} has no type specified`);
        }

        let result;
        if (nodeType === 'output') {
          // For output nodes, collect all previous results
          const allResults = processingOrder.map(prevNodeId => {
            const prevNode = nodes.find(n => n.id === prevNodeId);
            const prevResult = nodeResults[prevNodeId];
            const prevType = prevNode.type || (prevNode.data && prevNode.data.type);
            
            // Extract the actual content from the result
            const content = prevResult.content || extractAgentResult(prevResult);
            
            return `Results from ${prevType} (${prevNodeId}):\n${content}`;
          });
          
          // Execute output node with formatted results
          const outputResult = await executeOutputNode(allResults, nodeConfig);
          
          result = {
            content: outputResult,
            metadata: {
              nodeId,
              type: nodeType,
              timestamp: new Date().toISOString()
            }
          };
        } else {
          // Check if handler exists for this node type
          if (!agentHandlers[nodeType]) {
            throw new Error(`No handler found for node type: ${nodeType}`);
          }

          // Execute node handler (input, agent, etc.)
          const handlerResult = await agentHandlers[nodeType](inputString, nodeConfig);
          
          // Store result in a consistent format
          result = {
            content: typeof handlerResult === 'object' ? 
              extractAgentResult(handlerResult) : 
              handlerResult,
            metadata: {
              nodeId,
              type: nodeType,
              timestamp: new Date().toISOString()
            }
          };
        }

        nodeResults[nodeId] = result;
        processingOrder.push(nodeId);
        console.log(`Node ${nodeId} result:`, result);

        // Queue next nodes
        edges
          .filter(e => e.source === nodeId)
          .forEach(e => {
            inDegree[e.target]--;
            if (inDegree[e.target] === 0) {
              const nextNode = nodes.find(n => n.id === e.target);
              if (nextNode) queue.push(nextNode);
            }
          });

      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        throw new Error(`Error executing node ${nodeId}: ${error.message}`);
      }
    }

    // Return all results
    res.json({
      success: true,
      results: nodeResults,
      processingOrder
    });

  } catch (error) {
    console.error('Error in execute-flow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Orchestrator running on port 3000');
});