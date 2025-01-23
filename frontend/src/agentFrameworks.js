// Available AI Agent Frameworks
export const agentFrameworks = [
  {
    id: 'eliza',
    name: 'Eliza Agent',
    description: 'Create autonomous agents using Eliza OS framework with multi-client support and advanced memory capabilities',
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
          { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
          { value: 'llama', label: 'Llama' },
          { value: 'grok', label: 'Grok' },
          { value: 'gemini', label: 'Gemini' }
        ]
      },
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'apiKeys',
        fields: [
          { name: 'openai', label: 'OpenAI API Key' },
          { name: 'anthropic', label: 'Anthropic API Key' },
          { name: 'google', label: 'Google API Key' }
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
        name: 'clients',
        label: 'Client Connections',
        type: 'multiselect',
        options: [
          { value: 'discord', label: 'Discord' },
          { value: 'twitter', label: 'Twitter/X' },
          { value: 'telegram', label: 'Telegram' }
        ]
      },
      {
        name: 'memory',
        label: 'Memory Type',
        type: 'select',
        options: [
          { value: 'retrievable', label: 'Retrievable Memory' },
          { value: 'document', label: 'Document Store' }
        ]
      },
      {
        name: 'tools',
        label: 'Tools',
        type: 'multiselect',
        options: [
          { value: 'web-search', label: 'Web Search' },
          { value: 'document-interaction', label: 'Document Interaction' },
          { value: 'code-execution', label: 'Code Execution' },
          { value: 'file-operations', label: 'File Operations' }
        ]
      },
      {
        name: 'roomConfig',
        label: 'Room Configuration',
        type: 'select',
        options: [
          { value: 'single', label: 'Single Agent' },
          { value: 'multi', label: 'Multi-Agent Room' }
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
    description: 'Create task-driven autonomous agents with dynamic task generation',
    configFields: [
      {
        name: 'objective',
        label: 'Main Objective',
        type: 'text',
        placeholder: 'Enter the main goal for the agent'
      },
      {
        name: 'taskCreation',
        label: 'Task Creation Strategy',
        type: 'select',
        options: [
          { value: 'sequential', label: 'Sequential' },
          { value: 'priority', label: 'Priority-based' }
        ]
      },
      {
        name: 'maxTasks',
        label: 'Maximum Tasks',
        type: 'number',
        default: 5,
        min: 1,
        max: 20
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