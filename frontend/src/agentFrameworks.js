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
    description: 'A sophisticated conversational agent with social media integration and document analysis capabilities.',
    configFields: [
      // AI Model Configuration
      {
        id: 'modelConfig',
        label: 'AI Model Configuration',
        type: 'group',
        fields: [
          {
            id: 'foundationModel',
            label: 'AI Model',
            type: 'select',
            options: [
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              { value: 'gpt-4', label: 'GPT-4' },
              { value: 'claude-3-opus', label: 'Claude 3 Opus' },
              { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
            ],
            required: true,
            tooltip: 'Select the AI model to use for this node'
          },
          {
            id: 'apiKey',
            label: 'API Key',
            type: 'password',
            required: true,
            tooltip: 'Enter your API key for the selected model (OpenAI key for GPT models, Anthropic key for Claude models)'
          },
          {
            id: 'modelParams',
            label: 'Model Parameters',
            type: 'group',
            fields: {
              temperature: {
                name: 'temperature',
                label: 'Temperature',
                type: 'slider',
                min: 0,
                max: 1,
                step: 0.1,
                default: 0.7
              },
              maxTokens: {
                name: 'maxTokens',
                label: 'Max Tokens',
                type: 'number',
                min: 100,
                max: 4000,
                default: 1000
              },
              topP: {
                name: 'topP',
                label: 'Top P',
                type: 'slider',
                min: 0,
                max: 1,
                step: 0.1,
                default: 0.9
              }
            }
          }
        ]
      },

      // Core Agent Settings
      {
        name: 'agentName',
        label: 'Agent Name',
        type: 'text',
        default: 'Eliza',
        tooltip: 'Name of the conversational agent'
      },
      {
        name: 'agentRole',
        label: 'Agent Role',
        type: 'select',
        options: [
          { value: 'empathetic', label: 'Empathetic Listener' },
          { value: 'analytical', label: 'Analytical Guide' },
          { value: 'supportive', label: 'Supportive Coach' },
          { value: 'directive', label: 'Directive Advisor' },
          { value: 'reflective', label: 'Reflective Partner' }
        ],
        default: 'empathetic',
        tooltip: 'Primary interaction approach'
      },
      {
        name: 'conversationStyle',
        label: 'Conversation Style',
        type: 'select',
        options: [
          { value: 'empathetic', label: 'Empathetic' },
          { value: 'formal', label: 'Formal' },
          { value: 'casual', label: 'Casual' },
          { value: 'direct', label: 'Direct' },
          { value: 'supportive', label: 'Supportive' }
        ],
        default: 'empathetic',
        tooltip: 'Overall tone and style of conversation'
      },
      {
        name: 'reflectionLevel',
        label: 'Reflection Level',
        type: 'slider',
        min: 1,
        max: 10,
        default: 7,
        tooltip: 'How much to reflect user statements back (1-10)'
      },

      // Memory Configuration
      {
        name: 'memoryConfig',
        label: 'Memory Configuration',
        type: 'group',
        fields: {
          memoryType: {
            name: 'memoryType',
            label: 'Memory Type',
            type: 'select',
            options: [
              { value: 'buffer', label: 'Buffer Memory' },
              { value: 'summary', label: 'Summary Memory' },
              { value: 'conversation', label: 'Conversation Memory' }
            ],
            default: 'buffer'
          },
          maxMemoryItems: {
            name: 'maxMemoryItems',
            label: 'Max Memory Items',
            type: 'number',
            min: 5,
            max: 100,
            default: 20
          }
        }
      },

      // Social Media Integration
      {
        name: 'socialPlatforms',
        label: 'Social Media Integration',
        type: 'group',
        fields: {
          twitter: {
            name: 'twitter',
            label: 'Twitter/X Integration',
            type: 'group',
            fields: {
              enabled: {
                name: 'enabled',
                label: 'Enable Twitter',
                type: 'boolean',
                default: false
              },
              apiKey: {
                name: 'apiKey',
                label: 'API Key',
                type: 'password',
                showWhen: { field: 'enabled', value: true }
              },
              autoPost: {
                name: 'autoPost',
                label: 'Auto Post Responses',
                type: 'boolean',
                default: false,
                showWhen: { field: 'enabled', value: true }
              },
              postFrequency: {
                name: 'postFrequency',
                label: 'Post Frequency',
                type: 'select',
                options: [
                  { value: 'always', label: 'Every Response' },
                  { value: 'insights', label: 'Key Insights Only' },
                  { value: 'summary', label: 'Session Summary' }
                ],
                default: 'insights',
                showWhen: { field: 'enabled', value: true }
              }
            }
          },
          discord: {
            name: 'discord',
            label: 'Discord Integration',
            type: 'group',
            fields: {
              enabled: {
                name: 'enabled',
                label: 'Enable Discord',
                type: 'boolean',
                default: false
              },
              botToken: {
                name: 'botToken',
                label: 'Bot Token',
                type: 'password',
                showWhen: { field: 'enabled', value: true }
              },
              channels: {
                name: 'channels',
                label: 'Channel IDs',
                type: 'array',
                itemType: 'text',
                showWhen: { field: 'enabled', value: true }
              },
              autoPost: {
                name: 'autoPost',
                label: 'Auto Post Responses',
                type: 'boolean',
                default: false,
                showWhen: { field: 'enabled', value: true }
              },
              createThreads: {
                name: 'createThreads',
                label: 'Create Threads for Sessions',
                type: 'boolean',
                default: true,
                showWhen: { field: 'enabled', value: true }
              }
            }
          },
          telegram: {
            name: 'telegram',
            label: 'Telegram Integration',
            type: 'group',
            fields: {
              enabled: {
                name: 'enabled',
                label: 'Enable Telegram',
                type: 'boolean',
                default: false
              },
              botToken: {
                name: 'botToken',
                label: 'Bot Token',
                type: 'password',
                showWhen: { field: 'enabled', value: true }
              },
              channels: {
                name: 'channels',
                label: 'Channel IDs',
                type: 'array',
                itemType: 'text',
                showWhen: { field: 'enabled', value: true }
              },
              autoPost: {
                name: 'autoPost',
                label: 'Auto Post Responses',
                type: 'boolean',
                default: false,
                showWhen: { field: 'enabled', value: true }
              }
            }
          }
        }
      },

      // Document Processing
      {
        name: 'documentStoreConfig',
        label: 'Document Processing',
        type: 'group',
        fields: {
          enabled: {
            name: 'enabled',
            label: 'Enable Document Processing',
            type: 'boolean',
            default: false
          },
          storageType: {
            name: 'storageType',
            label: 'Storage Type',
            type: 'select',
            options: [
              { value: 'local', label: 'Local Storage' },
              { value: 'cloud', label: 'Cloud Storage' }
            ],
            default: 'local',
            showWhen: { field: 'enabled', value: true }
          },
          maxDocuments: {
            name: 'maxDocuments',
            label: 'Max Documents',
            type: 'number',
            default: 100,
            min: 10,
            max: 1000,
            showWhen: { field: 'enabled', value: true }
          },
          analysisDepth: {
            name: 'analysisDepth',
            label: 'Analysis Depth',
            type: 'select',
            options: [
              { value: 'basic', label: 'Basic Analysis' },
              { value: 'detailed', label: 'Detailed Analysis' },
              { value: 'comprehensive', label: 'Comprehensive Analysis' }
            ],
            default: 'detailed',
            showWhen: { field: 'enabled', value: true }
          }
        }
      },

      // Multi-Agent Collaboration
      {
        name: 'collaborators',
        label: 'Multi-Agent Collaboration',
        type: 'group',
        fields: {
          enabled: {
            name: 'enabled',
            label: 'Enable Multi-Agent Mode',
            type: 'boolean',
            default: false
          },
          agents: {
            name: 'agents',
            label: 'Collaborating Agents',
            type: 'array',
            itemType: 'group',
            showWhen: { field: 'enabled', value: true },
            fields: {
              name: {
                name: 'name',
                label: 'Agent Name',
                type: 'text'
              },
              role: {
                name: 'role',
                label: 'Role',
                type: 'select',
                options: [
                  { value: 'Supervisor', label: 'Supervisor' },
                  { value: 'Peer', label: 'Peer Therapist' },
                  { value: 'Assistant', label: 'Assistant' },
                  { value: 'Specialist', label: 'Specialist' }
                ]
              },
              specialization: {
                name: 'specialization',
                label: 'Specialization',
                type: 'select',
                options: [
                  { value: 'trauma', label: 'Trauma' },
                  { value: 'anxiety', label: 'Anxiety' },
                  { value: 'depression', label: 'Depression' },
                  { value: 'relationships', label: 'Relationships' }
                ],
                showWhen: { field: 'role', value: 'Specialist' }
              }
            }
          },
          collaborationStyle: {
            name: 'collaborationStyle',
            label: 'Collaboration Style',
            type: 'select',
            options: [
              { value: 'sequential', label: 'Sequential Processing' },
              { value: 'parallel', label: 'Parallel Processing' },
              { value: 'hybrid', label: 'Hybrid Approach' }
            ],
            default: 'sequential',
            showWhen: { field: 'enabled', value: true }
          }
        }
      },

      // Advanced Settings
      {
        name: 'advanced',
        label: 'Advanced Settings',
        type: 'group',
        fields: {
          maxIterations: {
            name: 'maxIterations',
            label: 'Max Iterations',
            type: 'number',
            default: 3,
            min: 1,
            max: 10
          },
          responseTimeout: {
            name: 'responseTimeout',
            label: 'Response Timeout (ms)',
            type: 'number',
            default: 30000,
            min: 5000,
            max: 60000
          },
          debugMode: {
            name: 'debugMode',
            label: 'Debug Mode',
            type: 'boolean',
            default: false
          },
          loggingLevel: {
            name: 'loggingLevel',
            label: 'Logging Level',
            type: 'select',
            options: [
              { value: 'error', label: 'Errors Only' },
              { value: 'warn', label: 'Warnings' },
              { value: 'info', label: 'Information' },
              { value: 'debug', label: 'Debug' },
              { value: 'trace', label: 'Trace' }
            ],
            default: 'info'
          }
        }
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
          { name: 'openai', label: 'OpenAI API Key', required: true },
          { name: 'serpapi', label: 'SerpAPI Key' },
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
      },
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'apiKeys',
        fields: [
          { name: 'openai', label: 'OpenAI API Key', required: true },
          { name: 'google', label: 'Google API Key' },
          { name: 'serpapi', label: 'SerpAPI Key' }
        ]
      },
      {
        name: 'foundationModel',
        label: 'Foundation Model',
        type: 'select',
        options: [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
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
        type: 'apiKeys',
        fields: [
          { name: 'openai', label: 'OpenAI API Key', required: true },
          { name: 'pinecone', label: 'Pinecone API Key' }
        ]
      },
      {
        name: 'foundationModel',
        label: 'Foundation Model',
        type: 'select',
        options: [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
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