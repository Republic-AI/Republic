const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { OpenAI } = require("langchain/llms/openai");
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { WebBrowser } = require("langchain/tools/webbrowser");
const { Calculator } = require("langchain/tools/calculator");
const { WikipediaQueryRun } = require("langchain/tools/wikipedia");
const { BufferMemory, SummaryMemory, ConversationSummaryMemory } = require("langchain/memory");
const { RetrievableMemory, DocumentStore } = require("langchain/memory");
const { WebSearchTool, DocumentTool, CodeExecutionTool, FileOperationsTool } = require("langchain/tools");
const { ElizaAgent } = require("langchain/agents/eliza");
const { ZerePyAgent } = require("langchain/agents/zerepy");
const { DiscordClient, TwitterClient, TelegramClient } = require("langchain/tools/clients");
const { 
  FarcasterClient, 
  EchochambersClient,
  BlockchainClient,
  GoatPluginManager 
} = require("langchain/tools/zerepy");
require("dotenv").config();

const app = express();
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
    switch (memoryType) {
      case 'buffer':
        memoryInstances[nodeId] = new BufferMemory();
        break;
      case 'summary':
        memoryInstances[nodeId] = new SummaryMemory();
        break;
      case 'conversation':
        memoryInstances[nodeId] = new ConversationSummaryMemory();
        break;
      default:
        memoryInstances[nodeId] = new BufferMemory();
    }
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

// Handle Eliza agent execution
const executeElizaAgent = async (input, config) => {
  try {
    // Initialize foundation model based on config
    const modelConfig = {
      model: config.foundationModel,
      apiKey: config.apiKeys[getModelProvider(config.foundationModel)],
      ...config.modelParams
    };

    // Initialize memory system
    const memory = config.memory === 'retrievable' ? 
      new RetrievableMemory() : new DocumentStore();

    // Initialize tools
    const tools = (config.tools || []).map(tool => {
      switch (tool) {
        case 'web-search':
          return new WebSearchTool();
        case 'document-interaction':
          return new DocumentTool();
        case 'code-execution':
          return new CodeExecutionTool();
        case 'file-operations':
          return new FileOperationsTool();
        default:
          return null;
      }
    }).filter(Boolean);

    // Initialize client connections
    const clients = (config.clients || []).map(client => {
      switch (client) {
        case 'discord':
          return new DiscordClient(config.apiKeys.discord);
        case 'twitter':
          return new TwitterClient(config.apiKeys.twitter);
        case 'telegram':
          return new TelegramClient(config.apiKeys.telegram);
        default:
          return null;
      }
    }).filter(Boolean);

    // Create agent instance
    const agent = new ElizaAgent({
      name: config.agentName,
      description: config.agentDescription,
      systemPrompt: config.systemPrompt,
      model: modelConfig,
      memory,
      tools,
      clients,
      roomConfig: config.roomConfig
    });

    // Execute agent
    const result = await agent.execute(input);
    return `[Eliza] ${result}`;
  } catch (error) {
    console.error('Error executing Eliza agent:', error);
    return `Error: ${error.message}`;
  }
};

// Handle ZerePy agent execution
const executeZerePyAgent = async (input, config) => {
  try {
    // Initialize foundation model
    const modelConfig = {
      provider: config.foundationModel,
      apiKey: config.apiKeys[config.foundationModel],
      ...config.modelParams
    };

    // Initialize social platform clients
    const socialClients = (config.socialPlatforms || []).map(platform => {
      switch (platform) {
        case 'twitter':
          return new TwitterClient(config.apiKeys.twitter);
        case 'farcaster':
          return new FarcasterClient(config.apiKeys.farcaster);
        case 'discord':
          return new DiscordClient(config.apiKeys.discord);
        case 'echochambers':
          return new EchochambersClient(config.apiKeys.echochambers);
        default:
          return null;
      }
    }).filter(Boolean);

    // Initialize blockchain clients
    const blockchainClients = (config.blockchainNetworks || []).map(network => {
      return new BlockchainClient(network, config.apiKeys[network]);
    });

    // Initialize GOAT plugins
    const pluginManager = new GoatPluginManager();
    (config.goatPlugins || []).forEach(plugin => {
      pluginManager.registerPlugin(plugin, config.apiKeys);
    });

    // Create agent instance
    const agent = new ZerePyAgent({
      name: config.agentName,
      bio: config.agentBio,
      traits: config.traits || [],
      model: modelConfig,
      socialClients,
      blockchainClients,
      pluginManager,
      taskWeights: config.taskWeights || {},
      timeBasedConfig: config.timeBasedConfig || {},
      loopDelay: config.loopDelay || 900
    });

    // Execute agent
    const result = await agent.execute(input);
    return `[ZerePy] ${result}`;
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

// Update agent handlers
const agentHandlers = {
  'input': executeInputNode,
  'output': executeOutputNode,
  'zerepy': executeZerePyAgent,
  'eliza': executeElizaAgent,
  'langchain': executeLangChainAgent,
  'autogpt': executeAutoGPTAgent,
  'babyagi': executeBabyAGIAgent
};

app.post('/execute-flow', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    const nodeResults = {};
    const inDegree = {};
    
    nodes.forEach(n => (inDegree[n.id] = 0));
    edges.forEach(e => { inDegree[e.target]++; });
    
    const queue = nodes.filter(n => inDegree[n.id] === 0);

    while (queue.length > 0) {
      const current = queue.shift();
      const nodeId = current.id;

      let inputString = current.inputText || "";
      if (edges.some(e => e.target === nodeId)) {
        const incomingEdge = edges.find(e => e.target === nodeId);
        if (incomingEdge) {
          const sourceId = incomingEdge.source;
          const prevOutput = nodeResults[sourceId] || "";
          inputString = inputString.replace("{PREV_RESULT}", prevOutput);
        }
      }

      let result;
      try {
        if (current.type === "python-llm") {
          const resp = await axios.post("http://python-llm-service:5001/run", { input: inputString });
          result = resp.data.result;
        } else if (current.type === "node-llm") {
          const resp = await axios.post("http://node-llm-service:5002/run", { input: inputString });
          result = resp.data.result;
        } else if (agentHandlers[current.type]) {
          // Execute custom agent
          const config = {
            ...current.data.config,
            nodeId // Add nodeId for memory management
          };
          result = await agentHandlers[current.type](inputString, config);
        } else {
          result = `No service matched for type: ${current.type}`;
        }
      } catch (error) {
        result = `Error executing node ${nodeId}: ${error.message}`;
        console.error(`Error executing node ${nodeId}:`, error);
      }

      nodeResults[nodeId] = result;

      edges
        .filter(e => e.source === nodeId)
        .forEach(e => {
          inDegree[e.target]--;
          if (inDegree[e.target] === 0) {
            const targetNode = nodes.find(n => n.id === e.target);
            queue.push(targetNode);
          }
        });
    }

    return res.json({ nodeResults });
  } catch (err) {
    console.error("Error in orchestrator /execute-flow:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Orchestrator running on port 3000');
});