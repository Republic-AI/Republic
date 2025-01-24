const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { OpenAI } = require("langchain/llms/openai");
const { ChatAnthropic } = require("langchain/chat_models/anthropic");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { WebBrowser } = require("langchain/tools");
const { Calculator } = require("langchain/tools");
const { WikipediaQueryRun } = require("langchain/tools");
const { BufferMemory, ConversationSummaryMemory } = require("langchain/memory");
const { WebSearchTool, DocumentTool, CodeExecutionTool, FileOperationsTool } = require("langchain/tools");
const { 
  EchochambersClient,
  BlockchainClient,
  GoatPluginManager 
} = require("langchain/tools");
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
        modelName: modelName,
        maxTokens: config.modelParams?.maxTokens || 1000,
        topP: config.modelParams?.topP || 1,
      };

      const openAIKey = config.apiKeys?.openai || process.env.OPENAI_API_KEY;
      if (!openAIKey) {
        throw new Error('OpenAI API key not found in config or environment variables');
      }
      
      openAIConfig.apiKey = openAIKey;
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

// ZerePy Agent Implementation
class ZerePyAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.name = config.agentName || 'ZerePy';
    this.bio = config.agentBio || 'Social media management agent';
    this.traits = config.traits || ['engaging', 'analytical'];
    this.socialPlatforms = this.initializeSocialPlatforms(config);
    this.taskWeights = config.taskWeights || {
      contentCreation: 0.4,
      engagement: 0.3,
      analysis: 0.3
    };
  }

  initializeSocialPlatforms(config) {
    const platforms = {};
    if (config.socialPlatforms) {
      config.socialPlatforms.forEach(platform => {
        switch (platform) {
          case 'twitter':
            platforms.twitter = new TwitterPlatform({ token: config.apiKeys?.twitter });
            break;
          case 'farcaster':
            platforms.farcaster = new FarcasterPlatform({ token: config.apiKeys?.farcaster });
            break;
          case 'discord':
            platforms.discord = new DiscordPlatform({ token: config.apiKeys?.discord });
            break;
        }
      });
    }
    return platforms;
  }

  async execute(input) {
    const context = await this.memory.loadMemoryVariables();
    
    // Generate content
    const prompt = `
System: You are ${this.name}, a social media management AI with the following traits: ${this.traits.join(', ')}.
Bio: ${this.bio}
Task: Create engaging social media content based on the following input.
Available Platforms: ${Object.keys(this.socialPlatforms).join(', ')}

Context: ${JSON.stringify(context.history)}
Input: ${input}

Generate platform-specific content that maintains a consistent message while optimizing for each platform's unique characteristics.
`;

    const result = await this.model.call(prompt);
    
    // Post to social platforms
    const postResults = await Promise.all(
      Object.entries(this.socialPlatforms).map(async ([platform, client]) => {
        try {
          return await client.post(result);
        } catch (error) {
          console.error(`Error posting to ${platform}:`, error);
          return { platform, success: false, error: error.message };
        }
      })
    );

    const output = {
      content: result,
      posts: postResults
    };

    await this.memory.saveContext({ input }, output);
    return JSON.stringify(output, null, 2);
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

// Initialize tools based on configuration
const initializeTools = (toolNames) => {
  const toolMap = {
    'search': new WebBrowser(),
    'calculator': new Calculator(),
    'wikipedia': new WikipediaQueryRun(),
    // Add more tools as needed
  };

  return toolNames.map(name => toolMap[name]).filter(Boolean);
};

// Initialize memory based on configuration
const initializeMemory = (nodeId, memoryType) => {
  if (!memoryInstances[nodeId]) {
    memoryInstances[nodeId] = new AdvancedMemory(memoryType);
  }
  return memoryInstances[nodeId];
};

// Handle LangChain agent execution
const executeLangChainAgent = async (input, config) => {
  const tools = initializeTools(config.tools || []);
  const memory = initializeMemory(config.nodeId, config.memory);
  
  const executor = await initializeAgentExecutorWithOptions(
    tools,
    new OpenAI({ temperature: 0.7 }),
    {
      agentType: config.agentType || "zero-shot-react",
      memory: memory,
      verbose: true
    }
  );

  const result = await executor.call({ input });
  return result.output;
};

// Handle AutoGPT agent execution
const executeAutoGPTAgent = async (input, config) => {
  // Implementation for AutoGPT
  const tools = initializeTools(config.tools || []);
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
    // Initialize platform instances instead of clients
    const socialPlatforms = {
      twitter: config.apiKeys?.twitter ? new TwitterPlatform({ token: config.apiKeys.twitter }) : null,
      farcaster: config.apiKeys?.farcaster ? new FarcasterPlatform({ token: config.apiKeys.farcaster }) : null,
      discord: config.apiKeys?.discord ? new DiscordPlatform({ token: config.apiKeys.discord }) : null,
    };

    // Process input
    const result = `[ZerePy] Processing: ${input}`;

    // Post to social platforms if configured
    if (config.socialPlatforms) {
      for (const platform of config.socialPlatforms) {
        const client = socialPlatforms[platform];
        if (client) {
          await client.post(result);
        }
      }
    }

    return result;
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
    switch (config.inputType) {
      case 'text':
        return input;

      case 'file':
        // Files are handled by the frontend and passed as base64
        // Here we just pass through the file data
        return config.fileUpload;

      case 'api':
        const response = await axios({
          method: config.apiMethod,
          url: config.apiEndpoint,
          headers: JSON.parse(config.apiHeaders || '{}'),
          data: JSON.parse(config.apiBody || '{}')
        });
        return JSON.stringify(response.data);

      default:
        return input;
    }
  } catch (error) {
    console.error('Error executing input node:', error);
    return `Error: ${error.message}`;
  }
};

// Handle output node execution
const executeOutputNode = async (input, config) => {
  try {
    let formattedOutput = input;

    // Format the output if needed
    if (config.formatOutput && config.formatOutput !== 'raw') {
      switch (config.formatOutput) {
        case 'json':
          formattedOutput = typeof input === 'string' ? JSON.parse(input) : input;
          formattedOutput = JSON.stringify(formattedOutput, null, 2);
          break;
        case 'xml':
          // Add XML formatting if needed
          formattedOutput = `<?xml version="1.0"?><root>${input}</root>`;
          break;
        case 'yaml':
          // Add YAML formatting if needed
          formattedOutput = input;
          break;
      }
    }

    // Send to API if configured
    if (config.outputType === 'api' || config.outputType === 'both') {
      try {
        await axios({
          method: config.apiMethod,
          url: config.apiEndpoint,
          headers: JSON.parse(config.apiHeaders || '{}'),
          data: formattedOutput
        });
      } catch (apiError) {
        console.error('Error sending to API:', apiError);
        formattedOutput = `${formattedOutput}\n\nAPI Error: ${apiError.message}`;
      }
    }

    return formattedOutput;
  } catch (error) {
    console.error('Error executing output node:', error);
    return `Error: ${error.message}`;
  }
};

// Update agent handlers with new implementations
const agentHandlers = {
  'input': executeInputNode,
  'output': executeOutputNode,
  'eliza': async (input, config) => {
    try {
      const agent = new ElizaAgent(config);
      return await agent.execute(input);
    } catch (error) {
      console.error('Error in Eliza agent:', error);
      return `Error: ${error.message}`;
    }
  },
  'zerepy': async (input, config) => {
    try {
      const agent = new ZerePyAgent(config);
      return await agent.execute(input);
    } catch (error) {
      console.error('Error in ZerePy agent:', error);
      return `Error: ${error.message}`;
    }
  },
  'autogpt': async (input, config) => {
    try {
      const agent = new AutoGPTAgent(config);
      return await agent.execute(input);
    } catch (error) {
      console.error('Error in AutoGPT agent:', error);
      return `Error: ${error.message}`;
    }
  },
  'babyagi': async (input, config) => {
    try {
      const agent = new BabyAGIAgent(config);
      return await agent.execute(input);
    } catch (error) {
      console.error('Error in BabyAGI agent:', error);
      return `Error: ${error.message}`;
    }
  }
};

app.post('/execute-flow', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    console.log('Received request with nodes:', JSON.stringify(nodes, null, 2));
    console.log('Received edges:', JSON.stringify(edges, null, 2));
    
    const nodeResults = {};
    const inDegree = {};
    
    nodes.forEach(n => (inDegree[n.id] = 0));
    edges.forEach(e => { inDegree[e.target]++; });
    
    const queue = nodes.filter(n => inDegree[n.id] === 0);
    console.log('Starting nodes:', queue.map(n => n.id));

    while (queue.length > 0) {
      const current = queue.shift();
      const nodeId = current.id;
      console.log(`Processing node ${nodeId}`);

      let inputString = current.inputText || "";
      if (edges.some(e => e.target === nodeId)) {
        const incomingEdge = edges.find(e => e.target === nodeId);
        if (incomingEdge) {
          const sourceId = incomingEdge.source;
          const prevOutput = nodeResults[sourceId] || "";
          inputString = inputString.replace("{PREV_RESULT}", prevOutput);
        }
      }
      console.log(`Node ${nodeId} input:`, inputString);

      let result;
      try {
        // Get the actual type from the node data
        const nodeType = current.type || (current.data && current.data.type);
        const nodeConfig = current.config || (current.data && current.data.config) || {};
        console.log(`Node ${nodeId} type:`, nodeType);
        console.log(`Node ${nodeId} config:`, JSON.stringify(nodeConfig, null, 2));
        
        if (nodeType === "python-llm") {
          const resp = await axios.post("http://python-llm-service:5001/run", { input: inputString });
          result = resp.data.result;
        } else if (nodeType === "node-llm") {
          const resp = await axios.post("http://node-llm-service:5002/run", { input: inputString });
          result = resp.data.result;
        } else if (agentHandlers[nodeType]) {
          // Execute custom agent with proper config
          const config = {
            ...nodeConfig,
            nodeId // Add nodeId for memory management
          };
          result = await agentHandlers[nodeType](inputString, config);
        } else {
          result = `No service matched for type: ${nodeType}`;
        }
        console.log(`Node ${nodeId} result:`, result);
      } catch (error) {
        console.error(`Error executing node ${nodeId}:`, error);
        result = `Error executing node ${nodeId}: ${error.message}`;
      }

      nodeResults[nodeId] = result;

      const nextNodes = edges
        .filter(e => e.source === nodeId)
        .map(e => {
          inDegree[e.target]--;
          return { target: e.target, degree: inDegree[e.target] };
        });
      console.log(`Node ${nodeId} next nodes:`, nextNodes);

      nextNodes.forEach(({ target, degree }) => {
        if (degree === 0) {
          const targetNode = nodes.find(n => n.id === target);
          queue.push(targetNode);
          console.log(`Added node ${target} to queue`);
        }
      });
    }

    console.log('Final results:', nodeResults);
    return res.json({ nodeResults });
  } catch (err) {
    console.error("Error in orchestrator /execute-flow:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Orchestrator running on port 3000');
});