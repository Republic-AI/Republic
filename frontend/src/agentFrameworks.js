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

      // Personality & Adaptation
      {
        name: 'personality',
        label: 'Personality & Adaptation',
        type: 'group',
        fields: {
          traits: {
            name: 'traits',
            label: 'Personality Traits',
            type: 'multiselect',
            options: [
              { value: 'empathetic', label: 'Empathetic' },
              { value: 'analytical', label: 'Analytical' },
              { value: 'supportive', label: 'Supportive' },
              { value: 'direct', label: 'Direct' }
            ]
          },
          traitStrength: {
            name: 'traitStrength',
            label: 'Trait Strength',
            type: 'slider',
            min: 1,
            max: 10,
            default: 7
          },
          adaptationRate: {
            name: 'adaptationRate',
            label: 'Adaptation Rate',
            type: 'slider',
            min: 1,
            max: 10,
            default: 5
          },
          contextSensitivity: {
            name: 'contextSensitivity',
            label: 'Context Sensitivity',
            type: 'slider',
            min: 1,
            max: 10,
            default: 8
          }
        }
      },

      // Advanced Features
      {
        name: 'features',
        label: 'Advanced Features',
        type: 'group',
        fields: {
          patternMatching: {
            name: 'patternMatching',
            label: 'Pattern Matching',
            type: 'group',
            fields: {
              enabled: {
                name: 'enabled',
                label: 'Enable Pattern Matching',
                type: 'boolean',
                default: true
              },
              sensitivity: {
                name: 'sensitivity',
                label: 'Pattern Sensitivity',
                type: 'slider',
                min: 1,
                max: 10,
                default: 7,
                showWhen: { field: 'enabled', value: true }
              },
              customPatterns: {
                name: 'customPatterns',
                label: 'Custom Patterns',
                type: 'array',
                itemType: 'text',
                showWhen: { field: 'enabled', value: true }
              }
            }
          },
          emotionalMemory: {
            name: 'emotionalMemory',
            label: 'Emotional Memory',
            type: 'group',
            fields: {
              enabled: {
                name: 'enabled',
                label: 'Enable Emotional Memory',
                type: 'boolean',
                default: true
              },
              memoryDepth: {
                name: 'memoryDepth',
                label: 'Memory Depth',
                type: 'number',
                min: 1,
                max: 100,
                default: 10,
                showWhen: { field: 'enabled', value: true }
              },
              emotionalPersistence: {
                name: 'emotionalPersistence',
                label: 'Emotional Persistence',
                type: 'slider',
                min: 1,
                max: 10,
                default: 5,
                showWhen: { field: 'enabled', value: true }
              }
            }
          },
          conversationHistory: {
            name: 'conversationHistory',
            label: 'Conversation History',
            type: 'group',
            fields: {
              enabled: {
                name: 'enabled',
                label: 'Enable History Analysis',
                type: 'boolean',
                default: true
              },
              historyLength: {
                name: 'historyLength',
                label: 'History Length',
                type: 'number',
                min: 1,
                max: 1000,
                default: 100,
                showWhen: { field: 'enabled', value: true }
              },
              analysisDepth: {
                name: 'analysisDepth',
                label: 'Analysis Depth',
                type: 'slider',
                min: 1,
                max: 10,
                default: 7,
                showWhen: { field: 'enabled', value: true }
              }
            }
          }
        }
      },

      // Integration Capabilities
      {
        name: 'integrations',
        label: 'Integration Capabilities',
        type: 'group',
        fields: {
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
              responseSettings: {
                name: 'responseSettings',
                label: 'Response Settings',
                type: 'group',
                showWhen: { field: 'enabled', value: true },
                fields: {
                  autoRespond: {
                    name: 'autoRespond',
                    label: 'Auto Respond',
                    type: 'boolean',
                    default: true
                  },
                  responseDelay: {
                    name: 'responseDelay',
                    label: 'Response Delay (ms)',
                    type: 'number',
                    min: 0,
                    max: 10000,
                    default: 1000
                  },
                  maxResponseLength: {
                    name: 'maxResponseLength',
                    label: 'Max Response Length',
                    type: 'number',
                    min: 1,
                    max: 2000,
                    default: 500
                  }
                }
              },
              permissions: {
                name: 'permissions',
                label: 'Bot Permissions',
                type: 'multiselect',
                showWhen: { field: 'enabled', value: true },
                options: [
                  { value: 'sendMessages', label: 'Send Messages' },
                  { value: 'readHistory', label: 'Read History' },
                  { value: 'manageThreads', label: 'Manage Threads' },
                  { value: 'mentionEveryone', label: 'Mention Everyone' }
                ]
              }
            }
          },
          twitter: {
            name: 'twitter',
            label: 'Twitter Integration',
            type: 'group',
            fields: {
              enabled: {
                name: 'enabled',
                label: 'Enable Twitter',
                type: 'boolean',
                default: false
              },
              credentials: {
                name: 'credentials',
                label: 'API Credentials',
                type: 'group',
                showWhen: { field: 'enabled', value: true },
                fields: {
                  apiKey: {
                    name: 'apiKey',
                    label: 'API Key',
                    type: 'password'
                  },
                  apiSecret: {
                    name: 'apiSecret',
                    label: 'API Secret',
                    type: 'password'
                  },
                  accessToken: {
                    name: 'accessToken',
                    label: 'Access Token',
                    type: 'password'
                  },
                  accessTokenSecret: {
                    name: 'accessTokenSecret',
                    label: 'Access Token Secret',
                    type: 'password'
                  }
                }
              },
              postSettings: {
                name: 'postSettings',
                label: 'Post Settings',
                type: 'group',
                showWhen: { field: 'enabled', value: true },
                fields: {
                  autoPost: {
                    name: 'autoPost',
                    label: 'Auto Post',
                    type: 'boolean',
                    default: false
                  },
                  postFrequency: {
                    name: 'postFrequency',
                    label: 'Post Frequency',
                    type: 'select',
                    options: [
                      { value: 'high', label: 'Every 15 minutes' },
                      { value: 'medium', label: 'Every hour' },
                      { value: 'low', label: 'Every 4 hours' }
                    ]
                  },
                  maxPostsPerDay: {
                    name: 'maxPostsPerDay',
                    label: 'Max Posts Per Day',
                    type: 'number',
                    min: 1,
                    max: 100,
                    default: 24
                  }
                }
              },
              contentFilters: {
                name: 'contentFilters',
                label: 'Content Filters',
                type: 'group',
                showWhen: { field: 'enabled', value: true },
                fields: {
                  keywords: {
                    name: 'keywords',
                    label: 'Keywords to Monitor',
                    type: 'array',
                    itemType: 'text'
                  },
                  excludedTerms: {
                    name: 'excludedTerms',
                    label: 'Terms to Exclude',
                    type: 'array',
                    itemType: 'text'
                  },
                  sentiment: {
                    name: 'sentiment',
                    label: 'Sentiment Filter',
                    type: 'multiselect',
                    options: [
                      { value: 'positive', label: 'Positive' },
                      { value: 'neutral', label: 'Neutral' },
                      { value: 'negative', label: 'Negative' }
                    ]
                  }
                }
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
              chatSettings: {
                name: 'chatSettings',
                label: 'Chat Settings',
                type: 'group',
                showWhen: { field: 'enabled', value: true },
                fields: {
                  allowedChats: {
                    name: 'allowedChats',
                    label: 'Allowed Chat IDs',
                    type: 'array',
                    itemType: 'text'
                  },
                  groupMode: {
                    name: 'groupMode',
                    label: 'Group Chat Mode',
                    type: 'select',
                    options: [
                      { value: 'all', label: 'Respond to All' },
                      { value: 'mentioned', label: 'Only When Mentioned' },
                      { value: 'commands', label: 'Commands Only' }
                    ]
                  },
                  privateMode: {
                    name: 'privateMode',
                    label: 'Private Chat Mode',
                    type: 'select',
                    options: [
                      { value: 'always', label: 'Always Respond' },
                      { value: 'filtered', label: 'Filter Messages' },
                      { value: 'commands', label: 'Commands Only' }
                    ]
                  }
                }
              },
              responseSettings: {
                name: 'responseSettings',
                label: 'Response Settings',
                type: 'group',
                showWhen: { field: 'enabled', value: true },
                fields: {
                  autoRespond: {
                    name: 'autoRespond',
                    label: 'Auto Respond',
                    type: 'boolean',
                    default: true
                  },
                  responseDelay: {
                    name: 'responseDelay',
                    label: 'Response Delay (ms)',
                    type: 'number',
                    min: 0,
                    max: 10000,
                    default: 1000
                  },
                  maxResponseLength: {
                    name: 'maxResponseLength',
                    label: 'Max Response Length',
                    type: 'number',
                    min: 1,
                    max: 4096,
                    default: 1000
                  }
                }
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
      // Basic Configuration
      {
        name: 'basicConfig',
        label: 'Basic Configuration',
        type: 'group',
        fields: {
          agentName: {
            name: 'agentName',
            label: 'Agent Name',
            type: 'text',
            placeholder: 'Enter a name for your agent',
            required: true
          },
          agentDescription: {
            name: 'agentDescription',
            label: 'Agent Description',
            type: 'textarea',
            placeholder: 'Describe what your agent does'
          },
          systemPrompt: {
            name: 'systemPrompt',
            label: 'System Prompt',
            type: 'textarea',
            placeholder: 'Enter the system prompt that defines your agent\'s behavior',
            required: true
          }
        }
      },

      // Model Configuration
      {
        name: 'modelConfig',
        label: 'Model Configuration',
        type: 'group',
        fields: {
          foundationModel: {
            name: 'foundationModel',
            label: 'Foundation Model',
            type: 'select',
            required: true,
            options: [
              { value: 'gpt-4', label: 'GPT-4' },
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              { value: 'claude-3-opus', label: 'Claude 3 Opus' },
              { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
            ]
          },
          modelParams: {
            name: 'modelParams',
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
                min: 1,
                max: 8192,
                default: 2048
              },
              topP: {
                name: 'topP',
                label: 'Top P',
                type: 'slider',
                min: 0,
                max: 1,
                step: 0.1,
                default: 0.9
              },
              presencePenalty: {
                name: 'presencePenalty',
                label: 'Presence Penalty',
                type: 'slider',
                min: -2,
                max: 2,
                step: 0.1,
                default: 0
              },
              frequencyPenalty: {
                name: 'frequencyPenalty',
                label: 'Frequency Penalty',
                type: 'slider',
                min: -2,
                max: 2,
                step: 0.1,
                default: 0
              }
            }
          }
        }
      },

      // Agent Configuration
      {
        name: 'agentConfig',
        label: 'Agent Configuration',
        type: 'group',
        fields: {
          agentType: {
            name: 'agentType',
            label: 'Agent Type',
            type: 'select',
            required: true,
            options: [
              { value: 'zero-shot-react', label: 'Zero Shot ReAct' },
              { value: 'conversational-react', label: 'Conversational ReAct' },
              { value: 'structured-chat', label: 'Structured Chat' },
              { value: 'plan-and-execute', label: 'Plan and Execute' },
              { value: 'openai-functions', label: 'OpenAI Functions' },
              { value: 'openai-assistant', label: 'OpenAI Assistant' }
            ]
          },
          maxIterations: {
            name: 'maxIterations',
            label: 'Max Iterations',
            type: 'number',
            min: 1,
            max: 100,
            default: 10
          },
          returnIntermediateSteps: {
            name: 'returnIntermediateSteps',
            label: 'Return Intermediate Steps',
            type: 'boolean',
            default: true
          }
        }
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
              { value: 'conversation', label: 'Conversation Memory' },
              { value: 'vector', label: 'Vector Store Memory' },
              { value: 'entity', label: 'Entity Memory' }
            ]
          },
          memoryParams: {
            name: 'memoryParams',
            label: 'Memory Parameters',
            type: 'group',
            fields: {
              maxTokens: {
                name: 'maxTokens',
                label: 'Max Memory Tokens',
                type: 'number',
                min: 100,
                max: 16384,
                default: 2000
              },
              returnMessages: {
                name: 'returnMessages',
                label: 'Return Messages',
                type: 'boolean',
                default: true
              },
              k: {
                name: 'k',
                label: 'K (Number of Messages)',
                type: 'number',
                min: 1,
                max: 100,
                default: 10
              }
            }
          }
        }
      },

      // Tools Configuration
      {
        name: 'toolsConfig',
        label: 'Tools Configuration',
        type: 'group',
        fields: {
          enabledTools: {
            name: 'enabledTools',
            label: 'Enabled Tools',
            type: 'multiselect',
            options: [
              { value: 'search', label: 'Web Search' },
              { value: 'calculator', label: 'Calculator' },
              { value: 'weather', label: 'Weather Info' },
              { value: 'wikipedia', label: 'Wikipedia' },
              { value: 'wolfram-alpha', label: 'Wolfram Alpha' },
              { value: 'google-search', label: 'Google Search' },
              { value: 'google-places', label: 'Google Places' },
              { value: 'news-api', label: 'News API' },
              { value: 'zapier-nla', label: 'Zapier NLA' }
            ]
          },
          customTools: {
            name: 'customTools',
            label: 'Custom Tools',
            type: 'array',
            itemType: 'group',
            fields: {
              name: {
                name: 'name',
                label: 'Tool Name',
                type: 'text'
              },
              description: {
                name: 'description',
                label: 'Tool Description',
                type: 'textarea'
              },
              apiEndpoint: {
                name: 'apiEndpoint',
                label: 'API Endpoint',
                type: 'text'
              },
              authType: {
                name: 'authType',
                label: 'Authentication Type',
                type: 'select',
                options: [
                  { value: 'none', label: 'None' },
                  { value: 'api-key', label: 'API Key' },
                  { value: 'oauth', label: 'OAuth' }
                ]
              }
            }
          }
        }
      },

      // API Keys Configuration
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'group',
        fields: {
          openai: {
            name: 'openai',
            label: 'OpenAI API Key',
            type: 'password',
            required: true
          },
          serpapi: {
            name: 'serpapi',
            label: 'SerpAPI Key',
            type: 'password'
          },
          wolframAlpha: {
            name: 'wolframAlpha',
            label: 'Wolfram Alpha API Key',
            type: 'password'
          },
          googleCloud: {
            name: 'googleCloud',
            label: 'Google Cloud API Key',
            type: 'password'
          },
          newsApi: {
            name: 'newsApi',
            label: 'News API Key',
            type: 'password'
          },
          zapier: {
            name: 'zapier',
            label: 'Zapier NLA API Key',
            type: 'password'
          }
        }
      },

      // Output Configuration
      {
        name: 'outputConfig',
        label: 'Output Configuration',
        type: 'group',
        fields: {
          outputFormat: {
            name: 'outputFormat',
            label: 'Output Format',
            type: 'select',
            options: [
              { value: 'text', label: 'Plain Text' },
              { value: 'json', label: 'JSON' },
              { value: 'markdown', label: 'Markdown' },
              { value: 'html', label: 'HTML' }
            ]
          },
          streaming: {
            name: 'streaming',
            label: 'Enable Streaming',
            type: 'boolean',
            default: false
          },
          maxOutputTokens: {
            name: 'maxOutputTokens',
            label: 'Max Output Tokens',
            type: 'number',
            min: 1,
            max: 4096,
            default: 1000
          }
        }
      }
    ]
  },
  {
    id: 'autogpt',
    name: 'AutoGPT Agent',
    description: 'Create autonomous agents that can break down and execute complex tasks',
    configFields: [
      // Basic Configuration
      {
        name: 'basicConfig',
        label: 'Basic Configuration',
        type: 'group',
        fields: {
          agentName: {
            name: 'agentName',
            label: 'Agent Name',
            type: 'text',
            required: true,
            placeholder: 'Enter a name for your agent'
          },
          agentRole: {
            name: 'agentRole',
            label: 'Agent Role',
            type: 'text',
            required: true,
            placeholder: 'Define the role of your agent'
          },
          agentGoals: {
            name: 'agentGoals',
            label: 'Agent Goals',
            type: 'array',
            itemType: 'text',
            required: true,
            placeholder: 'Enter the goals for your agent'
          },
          agentConstraints: {
            name: 'agentConstraints',
            label: 'Agent Constraints',
            type: 'array',
            itemType: 'text',
            placeholder: 'Define constraints for your agent'
          }
        }
      },

      // Model Configuration
      {
        name: 'modelConfig',
        label: 'Model Configuration',
        type: 'group',
        fields: {
          foundationModel: {
            name: 'foundationModel',
            label: 'Foundation Model',
            type: 'select',
            required: true,
            options: [
              { value: 'gpt-4', label: 'GPT-4' },
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              { value: 'claude-3-opus', label: 'Claude 3 Opus' },
              { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
            ]
          },
          modelParams: {
            name: 'modelParams',
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
                min: 1,
                max: 8192,
                default: 4096
              }
            }
          }
        }
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
              { value: 'local', label: 'Local File System' },
              { value: 'redis', label: 'Redis' },
              { value: 'pinecone', label: 'Pinecone' },
              { value: 'weaviate', label: 'Weaviate' }
            ]
          },
          memoryParams: {
            name: 'memoryParams',
            label: 'Memory Parameters',
            type: 'group',
            fields: {
              maxMemoryItems: {
                name: 'maxMemoryItems',
                label: 'Max Memory Items',
                type: 'number',
                min: 10,
                max: 1000,
                default: 100
              },
              memoryIndex: {
                name: 'memoryIndex',
                label: 'Memory Index Name',
                type: 'text',
                showWhen: { field: 'memoryType', values: ['pinecone', 'weaviate'] }
              },
              vectorDimensions: {
                name: 'vectorDimensions',
                label: 'Vector Dimensions',
                type: 'number',
                default: 1536,
                showWhen: { field: 'memoryType', values: ['pinecone', 'weaviate'] }
              }
            }
          }
        }
      },

      // Tools Configuration
      {
        name: 'toolsConfig',
        label: 'Tools Configuration',
        type: 'group',
        fields: {
          enabledTools: {
            name: 'enabledTools',
            label: 'Enabled Tools',
            type: 'multiselect',
            options: [
              { value: 'web-browser', label: 'Web Browser' },
              { value: 'file-operations', label: 'File Operations' },
              { value: 'terminal', label: 'Terminal Commands' },
              { value: 'python-code', label: 'Python Code Execution' },
              { value: 'search', label: 'Web Search' },
              { value: 'image-gen', label: 'Image Generation' },
              { value: 'data-analysis', label: 'Data Analysis' }
            ]
          },
          toolSettings: {
            name: 'toolSettings',
            label: 'Tool Settings',
            type: 'group',
            fields: {
              webBrowser: {
                name: 'webBrowser',
                label: 'Web Browser Settings',
                type: 'group',
                showWhen: { field: 'enabledTools', includes: 'web-browser' },
                fields: {
                  maxTabs: {
                    name: 'maxTabs',
                    label: 'Max Tabs',
                    type: 'number',
                    min: 1,
                    max: 10,
                    default: 3
                  },
                  javascript: {
                    name: 'javascript',
                    label: 'Enable JavaScript',
                    type: 'boolean',
                    default: true
                  }
                }
              },
              fileOperations: {
                name: 'fileOperations',
                label: 'File Operations Settings',
                type: 'group',
                showWhen: { field: 'enabledTools', includes: 'file-operations' },
                fields: {
                  allowedDirectories: {
                    name: 'allowedDirectories',
                    label: 'Allowed Directories',
                    type: 'array',
                    itemType: 'text'
                  },
                  maxFileSize: {
                    name: 'maxFileSize',
                    label: 'Max File Size (MB)',
                    type: 'number',
                    min: 1,
                    max: 1000,
                    default: 100
                  }
                }
              }
            }
          }
        }
      },

      // Execution Configuration
      {
        name: 'executionConfig',
        label: 'Execution Configuration',
        type: 'group',
        fields: {
          maxIterations: {
            name: 'maxIterations',
            label: 'Max Iterations',
            type: 'number',
            min: 1,
            max: 100,
            default: 25
          },
          iterationTimeout: {
            name: 'iterationTimeout',
            label: 'Iteration Timeout (seconds)',
            type: 'number',
            min: 10,
            max: 300,
            default: 60
          },
          allowLoops: {
            name: 'allowLoops',
            label: 'Allow Loops',
            type: 'boolean',
            default: true
          },
          continuousMode: {
            name: 'continuousMode',
            label: 'Continuous Mode',
            type: 'boolean',
            default: false
          }
        }
      },

      // API Keys Configuration
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'group',
        fields: {
          openai: {
            name: 'openai',
            label: 'OpenAI API Key',
            type: 'password',
            required: true
          },
          serpapi: {
            name: 'serpapi',
            label: 'SerpAPI Key',
            type: 'password'
          },
          pinecone: {
            name: 'pinecone',
            label: 'Pinecone API Key',
            type: 'password',
            showWhen: { field: 'memoryType', value: 'pinecone' }
          },
          weaviate: {
            name: 'weaviate',
            label: 'Weaviate API Key',
            type: 'password',
            showWhen: { field: 'memoryType', value: 'weaviate' }
          }
        }
      },

      // Workspace Configuration
      {
        name: 'workspaceConfig',
        label: 'Workspace Configuration',
        type: 'group',
        fields: {
          workspacePath: {
            name: 'workspacePath',
            label: 'Workspace Path',
            type: 'text',
            default: './workspace'
          },
          persistWorkspace: {
            name: 'persistWorkspace',
            label: 'Persist Workspace',
            type: 'boolean',
            default: true
          },
          logLevel: {
            name: 'logLevel',
            label: 'Log Level',
            type: 'select',
            options: [
              { value: 'debug', label: 'Debug' },
              { value: 'info', label: 'Info' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error' }
            ],
            default: 'info'
          }
        }
      }
    ]
  },
  {
    id: 'babyagi',
    name: 'BabyAGI Agent',
    description: 'Task-driven autonomous agent that breaks down objectives into tasks and executes them iteratively',
    configFields: [
      // Basic Configuration
      {
        name: 'basicConfig',
        label: 'Basic Configuration',
        type: 'group',
        fields: {
          agentName: {
            name: 'agentName',
            label: 'Agent Name',
            type: 'text',
            required: true,
            placeholder: 'Enter a name for your agent'
          },
          objective: {
            name: 'objective',
            label: 'Main Objective',
            type: 'textarea',
            required: true,
            placeholder: 'Define the main objective for the agent'
          },
          initialTask: {
            name: 'initialTask',
            label: 'Initial Task',
            type: 'textarea',
            required: true,
            placeholder: 'Define the first task to start working on'
          }
        }
      },

      // Model Configuration
      {
        name: 'modelConfig',
        label: 'Model Configuration',
        type: 'group',
        fields: {
          foundationModel: {
            name: 'foundationModel',
            label: 'Foundation Model',
            type: 'select',
            required: true,
            options: [
              { value: 'gpt-4', label: 'GPT-4' },
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              { value: 'claude-3-opus', label: 'Claude 3 Opus' },
              { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
            ]
          },
          modelParams: {
            name: 'modelParams',
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
                min: 1,
                max: 8192,
                default: 2048
              }
            }
          }
        }
      },

      // Task Management Configuration
      {
        name: 'taskConfig',
        label: 'Task Management',
        type: 'group',
        fields: {
          taskCreation: {
            name: 'taskCreation',
            label: 'Task Creation Settings',
            type: 'group',
            fields: {
              maxTasks: {
                name: 'maxTasks',
                label: 'Maximum Tasks',
                type: 'number',
                min: 1,
                max: 100,
                default: 10
              },
              taskPrioritization: {
                name: 'taskPrioritization',
                label: 'Task Prioritization',
                type: 'select',
                options: [
                  { value: 'importance', label: 'By Importance' },
                  { value: 'dependency', label: 'By Dependencies' },
                  { value: 'complexity', label: 'By Complexity' }
                ]
              },
              taskTimeout: {
                name: 'taskTimeout',
                label: 'Task Timeout (seconds)',
                type: 'number',
                min: 30,
                max: 3600,
                default: 300
              }
            }
          },
          executionStrategy: {
            name: 'executionStrategy',
            label: 'Execution Strategy',
            type: 'group',
            fields: {
              maxIterations: {
                name: 'maxIterations',
                label: 'Max Iterations',
                type: 'number',
                min: 1,
                max: 100,
                default: 5
              },
              iterationDelay: {
                name: 'iterationDelay',
                label: 'Iteration Delay (seconds)',
                type: 'number',
                min: 1,
                max: 60,
                default: 10
              },
              contextWindow: {
                name: 'contextWindow',
                label: 'Context Window',
                type: 'number',
                min: 1,
                max: 20,
                default: 5,
                tooltip: 'Number of previous tasks to consider for context'
              }
            }
          }
        }
      },

      // Memory Configuration
      {
        name: 'memoryConfig',
        label: 'Memory Configuration',
        type: 'group',
        fields: {
          vectorStore: {
            name: 'vectorStore',
            label: 'Vector Store',
            type: 'select',
            options: [
              { value: 'pinecone', label: 'Pinecone' },
              { value: 'chroma', label: 'ChromaDB' },
              { value: 'weaviate', label: 'Weaviate' },
              { value: 'milvus', label: 'Milvus' }
            ]
          },
          vectorStoreConfig: {
            name: 'vectorStoreConfig',
            label: 'Vector Store Configuration',
            type: 'group',
            fields: {
              indexName: {
                name: 'indexName',
                label: 'Index Name',
                type: 'text',
                default: 'babyagi-tasks'
              },
              dimensions: {
                name: 'dimensions',
                label: 'Vector Dimensions',
                type: 'number',
                min: 64,
                max: 1536,
                default: 1536
              },
              metric: {
                name: 'metric',
                label: 'Distance Metric',
                type: 'select',
                options: [
                  { value: 'cosine', label: 'Cosine Similarity' },
                  { value: 'euclidean', label: 'Euclidean Distance' },
                  { value: 'dotproduct', label: 'Dot Product' }
                ]
              }
            }
          },
          resultStorage: {
            name: 'resultStorage',
            label: 'Result Storage',
            type: 'group',
            fields: {
              storageType: {
                name: 'storageType',
                label: 'Storage Type',
                type: 'select',
                options: [
                  { value: 'local', label: 'Local File System' },
                  { value: 's3', label: 'AWS S3' },
                  { value: 'redis', label: 'Redis' }
                ]
              },
              retentionPeriod: {
                name: 'retentionPeriod',
                label: 'Retention Period (days)',
                type: 'number',
                min: 1,
                max: 365,
                default: 30
              }
            }
          }
        }
      },

      // API Keys Configuration
      {
        name: 'apiKeys',
        label: 'API Keys',
        type: 'group',
        fields: {
          openai: {
            name: 'openai',
            label: 'OpenAI API Key',
            type: 'password',
            required: true
          },
          pinecone: {
            name: 'pinecone',
            label: 'Pinecone API Key',
            type: 'password',
            showWhen: { field: 'vectorStore', value: 'pinecone' }
          },
          weaviate: {
            name: 'weaviate',
            label: 'Weaviate API Key',
            type: 'password',
            showWhen: { field: 'vectorStore', value: 'weaviate' }
          }
        }
      },

      // Advanced Configuration
      {
        name: 'advancedConfig',
        label: 'Advanced Configuration',
        type: 'group',
        fields: {
          logging: {
            name: 'logging',
            label: 'Logging Configuration',
            type: 'group',
            fields: {
              logLevel: {
                name: 'logLevel',
                label: 'Log Level',
                type: 'select',
                options: [
                  { value: 'debug', label: 'Debug' },
                  { value: 'info', label: 'Info' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'error', label: 'Error' }
                ],
                default: 'info'
              },
              logFormat: {
                name: 'logFormat',
                label: 'Log Format',
                type: 'select',
                options: [
                  { value: 'text', label: 'Plain Text' },
                  { value: 'json', label: 'JSON' }
                ]
              }
            }
          },
          performance: {
            name: 'performance',
            label: 'Performance Settings',
            type: 'group',
            fields: {
              batchSize: {
                name: 'batchSize',
                label: 'Batch Size',
                type: 'number',
                min: 1,
                max: 50,
                default: 5
              },
              concurrentTasks: {
                name: 'concurrentTasks',
                label: 'Concurrent Tasks',
                type: 'number',
                min: 1,
                max: 10,
                default: 3
              }
            }
          }
        }
      }
    ]
  },
  {
    id: 'zerepy',
    name: 'ZerePy Agent',
    description: 'Create autonomous agents using ZerePy framework with social platform integrations and blockchain capabilities',
    configFields: [
      // Basic Configuration
      {
        name: 'basicConfig',
        label: 'Basic Configuration',
        type: 'group',
        fields: {
          agentName: {
            name: 'agentName',
            label: 'Agent Name',
            type: 'text',
            required: true,
            placeholder: 'Enter a name for your agent'
          },
          agentBio: {
            name: 'agentBio',
            label: 'Agent Bio',
            type: 'textarea',
            placeholder: 'Enter multiple lines describing your agent\'s personality and background'
          },
          traits: {
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
          }
        }
      },

      // AI Model Configuration
      {
        name: 'modelConfig',
        label: 'AI Model Configuration',
        type: 'group',
        fields: {
          foundationModel: {
            name: 'foundationModel',
            label: 'Foundation Model',
            type: 'select',
            required: true,
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
          modelParams: {
            name: 'modelParams',
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
                min: 1,
                max: 8192,
                default: 2048
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
        }
      },

      // Social Media Configuration
      {
        name: 'socialConfig',
        label: 'Social Media Configuration',
        type: 'group',
        fields: {
          platforms: {
            name: 'platforms',
            label: 'Social Platforms',
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
                  apiSecret: {
                    name: 'apiSecret',
                    label: 'API Secret',
                    type: 'password',
                    showWhen: { field: 'enabled', value: true }
                  },
                  accessToken: {
                    name: 'accessToken',
                    label: 'Access Token',
                    type: 'password',
                    showWhen: { field: 'enabled', value: true }
                  },
                  accessTokenSecret: {
                    name: 'accessTokenSecret',
                    label: 'Access Token Secret',
                    type: 'password',
                    showWhen: { field: 'enabled', value: true }
                  },
                  engagementRules: {
                    name: 'engagementRules',
                    label: 'Engagement Rules',
                    type: 'group',
                    showWhen: { field: 'enabled', value: true },
                    fields: {
                      autoReply: {
                        name: 'autoReply',
                        label: 'Auto Reply',
                        type: 'boolean',
                        default: true
                      },
                      replyFrequency: {
                        name: 'replyFrequency',
                        label: 'Reply Frequency',
                        type: 'select',
                        options: [
                          { value: 'always', label: 'Always' },
                          { value: 'hourly', label: 'Hourly' },
                          { value: 'daily', label: 'Daily' }
                        ]
                      },
                      maxRepliesPerDay: {
                        name: 'maxRepliesPerDay',
                        label: 'Max Replies Per Day',
                        type: 'number',
                        min: 1,
                        max: 1000,
                        default: 100
                      }
                    }
                  }
                }
              },
              farcaster: {
                name: 'farcaster',
                label: 'Farcaster Integration',
                type: 'group',
                fields: {
                  enabled: {
                    name: 'enabled',
                    label: 'Enable Farcaster',
                    type: 'boolean',
                    default: false
                  },
                  fid: {
                    name: 'fid',
                    label: 'Farcaster ID',
                    type: 'text',
                    showWhen: { field: 'enabled', value: true }
                  },
                  mnemonic: {
                    name: 'mnemonic',
                    label: 'Account Mnemonic',
                    type: 'password',
                    showWhen: { field: 'enabled', value: true }
                  },
                  engagementSettings: {
                    name: 'engagementSettings',
                    label: 'Engagement Settings',
                    type: 'group',
                    showWhen: { field: 'enabled', value: true },
                    fields: {
                      autoRecast: {
                        name: 'autoRecast',
                        label: 'Auto Recast',
                        type: 'boolean',
                        default: true
                      },
                      autoReply: {
                        name: 'autoReply',
                        label: 'Auto Reply',
                        type: 'boolean',
                        default: true
                      }
                    }
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
                  }
                }
              }
            }
          }
        }
      },

      // Blockchain Configuration
      {
        name: 'blockchainConfig',
        label: 'Blockchain Configuration',
        type: 'group',
        fields: {
          networks: {
            name: 'networks',
            label: 'Blockchain Networks',
            type: 'group',
            fields: {
              solana: {
                name: 'solana',
                label: 'Solana Integration',
                type: 'group',
                fields: {
                  enabled: {
                    name: 'enabled',
                    label: 'Enable Solana',
                    type: 'boolean',
                    default: false
                  },
                  rpcEndpoint: {
                    name: 'rpcEndpoint',
                    label: 'RPC Endpoint',
                    type: 'text',
                    showWhen: { field: 'enabled', value: true }
                  },
                  privateKey: {
                    name: 'privateKey',
                    label: 'Private Key',
                    type: 'password',
                    showWhen: { field: 'enabled', value: true }
                  }
                }
              },
              ethereum: {
                name: 'ethereum',
                label: 'Ethereum Integration',
                type: 'group',
                fields: {
                  enabled: {
                    name: 'enabled',
                    label: 'Enable Ethereum',
                    type: 'boolean',
                    default: false
                  },
                  rpcEndpoint: {
                    name: 'rpcEndpoint',
                    label: 'RPC Endpoint',
                    type: 'text',
                    showWhen: { field: 'enabled', value: true }
                  },
                  privateKey: {
                    name: 'privateKey',
                    label: 'Private Key',
                    type: 'password',
                    showWhen: { field: 'enabled', value: true }
                  }
                }
              }
            }
          },
          plugins: {
            name: 'plugins',
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
          }
        }
      },

      // Task Configuration
      {
        name: 'taskConfig',
        label: 'Task Configuration',
        type: 'group',
        fields: {
          taskWeights: {
            name: 'taskWeights',
            label: 'Task Weights',
            type: 'group',
            fields: {
              postWeight: {
                name: 'postWeight',
                label: 'Post Weight',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.1,
                default: 1
              },
              replyWeight: {
                name: 'replyWeight',
                label: 'Reply Weight',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.1,
                default: 1
              },
              likeWeight: {
                name: 'likeWeight',
                label: 'Like Weight',
                type: 'slider',
                min: 0,
                max: 10,
                step: 0.1,
                default: 1
              }
            }
          },
          timeBasedConfig: {
            name: 'timeBasedConfig',
            label: 'Time-Based Configuration',
            type: 'group',
            fields: {
              tweetNightMultiplier: {
                name: 'tweetNightMultiplier',
                label: 'Tweet Night Multiplier',
                type: 'slider',
                min: 0,
                max: 1,
                step: 0.1,
                default: 0.4
              },
              engagementDayMultiplier: {
                name: 'engagementDayMultiplier',
                label: 'Engagement Day Multiplier',
                type: 'slider',
                min: 0,
                max: 2,
                step: 0.1,
                default: 1.5
              }
            }
          }
        }
      }
    ]
  }
]; 