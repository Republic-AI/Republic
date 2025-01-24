// Available AI Agent Frameworks
export const agentFrameworks = [
  {
    id: 'input',
    name: 'Input Node',
    description: 'Input node for providing data through text, file upload, or API import',
    configFields: [
      {
        name: 'inputType',
        label: 'Input Type',
        type: 'select',
        options: [
          { value: 'text', label: 'Text Input' },
          { value: 'file', label: 'File Upload' },
          { value: 'api', label: 'API Import' }
        ]
      },
      {
        name: 'fileUpload',
        label: 'Upload Files',
        type: 'file',
        accept: '*/*',
        multiple: true,
        showWhen: { field: 'inputType', value: 'file' }
      },
      {
        name: 'apiEndpoint',
        label: 'API Endpoint',
        type: 'text',
        placeholder: 'https://api.example.com/data',
        showWhen: { field: 'inputType', value: 'api' }
      },
      {
        name: 'apiMethod',
        label: 'HTTP Method',
        type: 'select',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' }
        ],
        showWhen: { field: 'inputType', value: 'api' }
      },
      {
        name: 'apiHeaders',
        label: 'Headers',
        type: 'json',
        placeholder: '{\n  "Authorization": "Bearer token",\n  "Content-Type": "application/json"\n}',
        showWhen: { field: 'inputType', value: 'api' }
      },
      {
        name: 'apiBody',
        label: 'Request Body',
        type: 'json',
        placeholder: '{\n  "key": "value"\n}',
        showWhen: { field: 'inputType', value: 'api' }
      }
    ]
  },
  {
    id: 'output',
    name: 'Output Node',
    description: 'Output node for displaying results and exporting data through API',
    configFields: [
      {
        name: 'outputType',
        label: 'Output Type',
        type: 'select',
        options: [
          { value: 'display', label: 'Display Only' },
          { value: 'api', label: 'API Export' },
          { value: 'both', label: 'Display & Export' }
        ]
      },
      {
        name: 'apiEndpoint',
        label: 'API Endpoint',
        type: 'text',
        placeholder: 'https://api.example.com/webhook',
        showWhen: { field: 'outputType', values: ['api', 'both'] }
      },
      {
        name: 'apiMethod',
        label: 'HTTP Method',
        type: 'select',
        options: [
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' }
        ],
        showWhen: { field: 'outputType', values: ['api', 'both'] }
      },
      {
        name: 'apiHeaders',
        label: 'Headers',
        type: 'json',
        placeholder: '{\n  "Authorization": "Bearer token",\n  "Content-Type": "application/json"\n}',
        showWhen: { field: 'outputType', values: ['api', 'both'] }
      },
      {
        name: 'formatOutput',
        label: 'Format Output',
        type: 'select',
        options: [
          { value: 'raw', label: 'Raw Text' },
          { value: 'json', label: 'JSON' },
          { value: 'xml', label: 'XML' },
          { value: 'yaml', label: 'YAML' }
        ],
        showWhen: { field: 'outputType', values: ['api', 'both'] }
      }
    ]
  },
  {
    id: 'eliza',
    name: 'Eliza Agent',
    description: 'Create autonomous agents using Eliza framework',
    configFields: [
      {
        name: 'agentName',
        label: 'Agent Name',
        type: 'text',
        required: true,
        description: 'Name of your Eliza agent'
      },
      {
        name: 'agentDescription',
        label: 'Agent Description',
        type: 'textarea',
        required: true,
        description: 'Description of your agent\'s personality and capabilities'
      },
      {
        name: 'systemPrompt',
        label: 'System Prompt',
        type: 'textarea',
        required: true,
        description: 'System instructions for the agent'
      },
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'object',
        fields: [
          {
            name: 'openai',
            label: 'OpenAI API Key',
            type: 'password',
            required: true,
            description: 'Your OpenAI API key'
          }
        ]
      }
    ]
  },
  {
    id: 'langchain',
    name: 'LangChain Agent',
    description: 'Create agents using LangChain framework with tools and memory',
    configFields: [
      {
        name: 'agentName',
        label: 'Agent Name',
        type: 'text',
        placeholder: 'Enter a name for your agent'
      },
      {
        name: 'agentDescription',
        label: 'Agent Description',
        type: 'textarea',
        placeholder: 'Describe what your agent does'
      },
      {
        name: 'systemPrompt',
        label: 'System Prompt',
        type: 'textarea',
        placeholder: 'Enter the system prompt that defines your agent\'s behavior'
      },
      {
        name: 'foundationModel',
        label: 'Foundation Model',
        type: 'select',
        options: [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          { value: 'claude-3-opus', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
        ]
      },
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'apiKeys',
        fields: [
          { name: 'openai', label: 'OpenAI API Key' },
          { name: 'anthropic', label: 'Anthropic API Key' }
        ]
      },
      {
        name: 'modelParams',
        label: 'Model Parameters',
        type: 'modelParams',
        params: [
          { name: 'temperature', label: 'Temperature', default: 0.7, min: 0, max: 1, step: 0.1 },
          { name: 'maxTokens', label: 'Max Tokens', default: 2048, min: 1, max: 8192 },
          { name: 'topP', label: 'Top P', default: 0.9, min: 0, max: 1, step: 0.1 }
        ]
      },
      {
        name: 'agentType',
        label: 'Agent Type',
        type: 'select',
        options: [
          { value: 'zero-shot-react', label: 'Zero Shot ReAct' },
          { value: 'conversational-react', label: 'Conversational ReAct' },
          { value: 'structured-chat', label: 'Structured Chat' }
        ]
      },
      {
        name: 'tools',
        label: 'Tools',
        type: 'multiselect',
        options: [
          { value: 'search', label: 'Web Search' },
          { value: 'calculator', label: 'Calculator' },
          { value: 'weather', label: 'Weather Info' },
          { value: 'wikipedia', label: 'Wikipedia' }
        ]
      },
      {
        name: 'memory',
        label: 'Memory Type',
        type: 'select',
        options: [
          { value: 'buffer', label: 'Buffer Memory' },
          { value: 'summary', label: 'Summary Memory' },
          { value: 'conversation', label: 'Conversation Memory' }
        ]
      }
    ]
  },
  {
    id: 'autogpt',
    name: 'AutoGPT Agent',
    description: 'Create autonomous agents that can break down and execute complex tasks',
    configFields: [
      {
        name: 'goalStrategy',
        label: 'Goal Strategy',
        type: 'select',
        options: [
          { value: 'single-task', label: 'Single Task' },
          { value: 'multi-task', label: 'Multiple Tasks' }
        ]
      },
      {
        name: 'maxIterations',
        label: 'Max Iterations',
        type: 'number',
        default: 5,
        min: 1,
        max: 20
      },
      {
        name: 'tools',
        label: 'Enabled Tools',
        type: 'multiselect',
        options: [
          { value: 'web-browse', label: 'Web Browser' },
          { value: 'file-ops', label: 'File Operations' },
          { value: 'code-exec', label: 'Code Execution' }
        ]
      }
    ]
  },
  {
    id: 'babyagi',
    name: 'BabyAGI Agent',
    description: 'Task-driven autonomous agent that breaks down objectives into tasks and executes them iteratively',
    configFields: [
      {
        name: 'objective',
        label: 'Objective',
        type: 'textarea',
        required: true,
        description: 'The main goal or objective for the agent to accomplish'
      },
      {
        name: 'initialTask',
        label: 'Initial Task',
        type: 'textarea',
        required: true,
        description: 'The first task to start working on the objective'
      },
      {
        name: 'modelName',
        label: 'Model Name',
        type: 'select',
        options: [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
        ],
        required: true,
        description: 'The language model to use for task execution'
      },
      {
        name: 'maxIterations',
        label: 'Maximum Iterations',
        type: 'number',
        required: true,
        default: 5,
        description: 'Maximum number of task iterations to perform'
      },
      {
        name: 'vectorStore',
        label: 'Vector Store',
        type: 'select',
        options: [
          { value: 'pinecone', label: 'Pinecone' },
          { value: 'chroma', label: 'ChromaDB' }
        ],
        required: true,
        description: 'Vector database for storing and retrieving task results'
      },
      {
        name: 'pineconeApiKey',
        label: 'Pinecone API Key',
        type: 'password',
        required: false,
        showIf: { field: 'vectorStore', value: 'pinecone' },
        description: 'API key for Pinecone vector database'
      },
      {
        name: 'pineconeEnvironment',
        label: 'Pinecone Environment',
        type: 'text',
        required: false,
        showIf: { field: 'vectorStore', value: 'pinecone' },
        description: 'Pinecone environment (e.g., "us-west1-gcp")'
      },
      {
        name: 'pineconeIndex',
        label: 'Pinecone Index',
        type: 'text',
        required: false,
        showIf: { field: 'vectorStore', value: 'pinecone' },
        description: 'Name of the Pinecone index to use'
      },
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'object',
        fields: [
          {
            name: 'openai',
            label: 'OpenAI API Key',
            type: 'password',
            required: true,
            description: 'Your OpenAI API key'
          }
        ]
      }
    ]
  },
  {
    id: 'zerepy',
    name: 'ZerePy Agent',
    description: 'Create autonomous agents using ZerePy framework with social platform integrations and blockchain capabilities',
    configFields: [
      {
        name: 'agentName',
        label: 'Agent Name',
        type: 'text',
        placeholder: 'Enter a name for your agent'
      },
      {
        name: 'agentBio',
        label: 'Agent Bio',
        type: 'textarea',
        placeholder: 'Enter multiple lines describing your agent\'s personality and background'
      },
      {
        name: 'traits',
        label: 'Agent Traits',
        type: 'multiselect',
        options: [
          { value: 'curious', label: 'Curious' },
          { value: 'creative', label: 'Creative' },
          { value: 'analytical', label: 'Analytical' },
          { value: 'friendly', label: 'Friendly' },
          { value: 'professional', label: 'Professional' },
          { value: 'humorous', label: 'Humorous' }
        ]
      },
      {
        name: 'foundationModel',
        label: 'Foundation Model',
        type: 'select',
        options: [
          { value: 'openai', label: 'OpenAI' },
          { value: 'anthropic', label: 'Anthropic' },
          { value: 'eternalai', label: 'EternalAI' },
          { value: 'ollama', label: 'Ollama' },
          { value: 'hyperbolic', label: 'Hyperbolic' },
          { value: 'galadriel', label: 'Galadriel' },
          { value: 'allora', label: 'Allora' },
          { value: 'grok', label: 'xAI (Grok)' }
        ]
      },
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'apiKeys',
        fields: [
          { name: 'openai', label: 'OpenAI API Key' },
          { name: 'anthropic', label: 'Anthropic API Key' },
          { name: 'eternalai', label: 'EternalAI API Key' },
          { name: 'hyperbolic', label: 'Hyperbolic API Key' },
          { name: 'galadriel', label: 'Galadriel API Key' }
        ]
      },
      {
        name: 'modelParams',
        label: 'Model Parameters',
        type: 'modelParams',
        params: [
          { name: 'temperature', label: 'Temperature', default: 0.7, min: 0, max: 1, step: 0.1 },
          { name: 'maxTokens', label: 'Max Tokens', default: 2048, min: 1, max: 8192 }
        ]
      },
      {
        name: 'socialPlatforms',
        label: 'Social Platforms',
        type: 'multiselect',
        options: [
          { value: 'twitter', label: 'Twitter/X' },
          { value: 'farcaster', label: 'Farcaster' },
          { value: 'discord', label: 'Discord' },
          { value: 'echochambers', label: 'Echochambers' }
        ]
      },
      {
        name: 'blockchainNetworks',
        label: 'Blockchain Networks',
        type: 'multiselect',
        options: [
          { value: 'solana', label: 'Solana' },
          { value: 'ethereum', label: 'Ethereum' },
          { value: 'sonic', label: 'Sonic' }
        ]
      },
      {
        name: 'goatPlugins',
        label: 'GOAT Plugins',
        type: 'multiselect',
        options: [
          { value: 'erc20', label: 'ERC20 Token Management' },
          { value: 'coingecko', label: 'CoinGecko Price Data' },
          { value: '1inch', label: '1inch DEX Aggregator' },
          { value: 'opensea', label: 'OpenSea NFT' },
          { value: 'nansen', label: 'Nansen Analytics' },
          { value: 'dexscreener', label: 'DEX Screener' },
          { value: 'rugcheck', label: 'Token Security Check' }
        ]
      },
      {
        name: 'taskWeights',
        label: 'Task Weights',
        type: 'modelParams',
        params: [
          { name: 'postWeight', label: 'Post Weight', default: 1, min: 0, max: 10, step: 0.1 },
          { name: 'replyWeight', label: 'Reply Weight', default: 1, min: 0, max: 10, step: 0.1 },
          { name: 'likeWeight', label: 'Like Weight', default: 1, min: 0, max: 10, step: 0.1 }
        ]
      },
      {
        name: 'timeBasedConfig',
        label: 'Time-Based Configuration',
        type: 'modelParams',
        params: [
          { name: 'tweetNightMultiplier', label: 'Tweet Night Multiplier', default: 0.4, min: 0, max: 1, step: 0.1 },
          { name: 'engagementDayMultiplier', label: 'Engagement Day Multiplier', default: 1.5, min: 0, max: 2, step: 0.1 }
        ]
      },
      {
        name: 'loopDelay',
        label: 'Loop Delay (seconds)',
        type: 'number',
        default: 900,
        min: 60,
        max: 3600
      }
    ]
  }
]; 