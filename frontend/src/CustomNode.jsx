import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';
import { agentFrameworks } from './agentFrameworks';

const defaultConfig = {
  modelConfig: {
    foundationModel: 'gpt-3.5-turbo',
    modelParams: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1
    }
  },
  apiKey: ''
};

// Configuration fields for different node types
const NODE_CONFIGS = {
  'eliza': {
    fields: {
      // Core Configuration
      therapistName: {
        type: 'text',
        label: 'Therapist Name',
        default: 'Eliza',
        tooltip: 'Name of the therapist personality'
      },
      therapistRole: {
        type: 'select',
        label: 'Role',
        options: ['Rogerian', 'Cognitive-Behavioral', 'Psychodynamic', 'Humanistic'],
        default: 'Rogerian',
        tooltip: 'Therapeutic approach style'
      },
      conversationStyle: {
        type: 'select',
        label: 'Conversation Style',
        options: ['Formal', 'Casual', 'Empathetic', 'Direct'],
        default: 'Empathetic',
        tooltip: 'Overall tone of conversation'
      },
      reflectionLevel: {
        type: 'slider',
        label: 'Reflection Level',
        min: 0,
        max: 10,
        default: 7,
        tooltip: 'How much to reflect user statements back'
      },

      // Social Platform Integration
      socialPlatforms: {
        type: 'group',
        label: 'Social Platforms',
        fields: {
          twitter: {
            type: 'group',
            label: 'Twitter/X Integration',
            fields: {
              enabled: {
                type: 'boolean',
                label: 'Enable Twitter',
                default: false
              },
              apiKey: {
                type: 'password',
                label: 'API Key',
                showWhen: { field: 'enabled', value: true }
              },
              autoPost: {
                type: 'boolean',
                label: 'Auto Post Responses',
                default: false,
                showWhen: { field: 'enabled', value: true }
              }
            }
          },
          discord: {
            type: 'group',
            label: 'Discord Integration',
            fields: {
              enabled: {
                type: 'boolean',
                label: 'Enable Discord',
                default: false
              },
              botToken: {
                type: 'password',
                label: 'Bot Token',
                showWhen: { field: 'enabled', value: true }
              },
              channels: {
                type: 'array',
                label: 'Channel IDs',
                itemType: 'text',
                showWhen: { field: 'enabled', value: true }
              },
              autoPost: {
                type: 'boolean',
                label: 'Auto Post Responses',
                default: false,
                showWhen: { field: 'enabled', value: true }
              }
            }
          },
          telegram: {
            type: 'group',
            label: 'Telegram Integration',
            fields: {
              enabled: {
                type: 'boolean',
                label: 'Enable Telegram',
                default: false
              },
              botToken: {
                type: 'password',
                label: 'Bot Token',
                showWhen: { field: 'enabled', value: true }
              },
              channels: {
                type: 'array',
                label: 'Channel IDs',
                itemType: 'text',
                showWhen: { field: 'enabled', value: true }
              },
              autoPost: {
                type: 'boolean',
                label: 'Auto Post Responses',
                default: false,
                showWhen: { field: 'enabled', value: true }
              }
            }
          }
        }
      },

      // Document Store Configuration
      documentStoreConfig: {
        type: 'group',
        label: 'Document Processing',
        fields: {
          enabled: {
            type: 'boolean',
            label: 'Enable Document Processing',
            default: false
          },
          storageType: {
            type: 'select',
            label: 'Storage Type',
            options: ['local', 'cloud'],
            default: 'local',
            showWhen: { field: 'enabled', value: true }
          },
          maxDocuments: {
            type: 'number',
            label: 'Max Documents',
            default: 100,
            showWhen: { field: 'enabled', value: true }
          }
        }
      },

      // Multi-Agent Configuration
      collaborators: {
        type: 'group',
        label: 'Collaborating Agents',
        fields: {
          enabled: {
            type: 'boolean',
            label: 'Enable Multi-Agent Mode',
            default: false
          },
          agents: {
            type: 'array',
            label: 'Collaborating Agents',
            itemType: 'group',
            showWhen: { field: 'enabled', value: true },
            fields: {
              name: {
                type: 'text',
                label: 'Agent Name'
              },
              role: {
                type: 'select',
                label: 'Role',
                options: ['Supervisor', 'Peer', 'Assistant']
              }
            }
          }
        }
      },

      // Advanced Settings
      advanced: {
        type: 'group',
        label: 'Advanced Settings',
        fields: {
          maxIterations: {
            type: 'number',
            label: 'Max Iterations',
            default: 3
          },
          responseTimeout: {
            type: 'number',
            label: 'Response Timeout (ms)',
            default: 30000
          },
          debugMode: {
            type: 'boolean',
            label: 'Debug Mode',
            default: false
          }
        }
      }
    }
  }
  // ... other node types ...
};

export default function CustomNode({ data, isConnectable }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState(() => {
    // Initialize with default config if none exists
    return data.config || { ...defaultConfig };
  });
  
  // Update config when data changes
  useEffect(() => {
    if (data.config) {
      setConfig(data.config);
    }
  }, [data.config]);

  const framework = data.framework ? agentFrameworks.find(f => f.id === data.framework) : null;

  const handleTypeChange = (newType) => {
    const framework = agentFrameworks.find(f => f.id === newType);
    const newConfig = framework ? createDefaultConfig(framework) : { ...defaultConfig };
    data.onChange({
      ...data,
      type: newType,
      framework: framework?.id,
      config: newConfig
    });
  };

  const createDefaultConfig = (framework) => {
    const config = {};
    framework.configFields.forEach(field => {
      if (field.type === 'modelParams') {
        const params = {};
        field.params.forEach(param => {
          params[param.name] = param.default;
        });
        config[field.name] = params;
      } else if (field.type === 'apiKeys') {
        const keys = {};
        field.fields.forEach(f => {
          keys[f.name] = '';
        });
        config[field.name] = keys;
      } else if (field.id === 'modelConfig') {
        const keys = {};
        field.fields.forEach(f => {
          keys[f.id] = '';
        });
        config[field.id] = keys;
      } else {
        config[field.name] = field.default || 
          (field.type === 'select' ? field.options[0].value : '') ||
          (field.type === 'multiselect' ? [] : '');
      }
    });
    return config;
  };

  const handleConfigChange = (fieldName, value, subField = null) => {
    try {
      console.log(`Updating config - Field: ${fieldName}, Value: ${value ? '[PRESENT]' : '[EMPTY]'}`);
      
      if (subField) {
        data.onChange({
          ...data,
          config: {
            ...data.config,
            [fieldName]: {
              ...(data.config?.[fieldName] || {}),
              [subField]: value
            }
          }
        });
      } else {
        data.onChange({
          ...data,
          config: {
            ...(data.config || defaultConfig),
            [fieldName]: value
          }
        });
      }
    } catch (error) {
      console.error('Error updating config:', error);
      // Keep the previous state on error
      data.onChange({
        ...data,
        config: data.config || defaultConfig
      });
    }
  };

  const renderConfigField = (field) => {
    const value = field.type === 'group' ? 
      data.config[field.name] || {} :
      data.config[field.name] || field.default;

    // Check if field should be shown based on conditions
    if (field.showWhen) {
      const conditionField = data.config[field.showWhen.field];
      if (conditionField !== field.showWhen.value) {
        return null;
      }
    }

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            className="node-input"
          />
        );

      case 'password':
        return (
          <input
            type="password"
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            className="node-input"
          />
        );

      case 'select':
        return (
          <select
            value={value || field.default}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            className="node-select"
          >
            {field.options.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );

      case 'slider':
        return (
          <div className="slider-container">
            <input
              type="range"
              min={field.min}
              max={field.max}
              value={value || field.default}
              onChange={(e) => handleConfigChange(field.name, parseInt(e.target.value))}
              className="node-slider"
            />
            <span className="slider-value">{value || field.default}</span>
          </div>
        );

      case 'boolean':
        return (
          <label className="toggle-container">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleConfigChange(field.name, e.target.checked)}
              className="node-toggle"
            />
            <span className="toggle-label">{field.label}</span>
          </label>
        );

      case 'array':
        const items = value || [];
        return (
          <div className="array-container">
            {items.map((item, index) => (
              <div key={index} className="array-item">
                {field.itemType === 'group' ? (
                  Object.entries(field.fields).map(([fieldName, subField]) => (
                    <div key={fieldName} className="group-field">
                      <label>{subField.label}</label>
                      {renderConfigField({
                        ...subField,
                        name: `${field.name}.${index}.${fieldName}`,
                        value: item[fieldName]
                      })}
                    </div>
                  ))
                ) : (
                  <input
                    type={field.itemType}
                    value={item}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index] = e.target.value;
                      handleConfigChange(field.name, newItems);
                    }}
                    className="node-input"
                  />
                )}
                <button
                  onClick={() => {
                    const newItems = items.filter((_, i) => i !== index);
                    handleConfigChange(field.name, newItems);
                  }}
                  className="remove-item-btn"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItem = field.itemType === 'group' ? {} : '';
                handleConfigChange(field.name, [...items, newItem]);
              }}
              className="add-item-btn"
            >
              + Add {field.label}
            </button>
          </div>
        );

      case 'group':
        return (
          <div className="group-container">
            {Object.entries(field.fields).map(([fieldName, subField]) => (
              <div key={fieldName} className="group-field">
                <label>{subField.label}</label>
                {renderConfigField({
                  ...subField,
                  name: `${subField.id}`,
                  value: value[subField.id]
                })}
              </div>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            min={field.min}
            max={field.max}
            step={field.step || 1}
            value={value || field.default}
            onChange={(e) => handleConfigChange(field.name, parseFloat(e.target.value))}
            className="node-input"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            className="node-input"
          />
        );
    }
  };

  const renderConfigFields = () => {
    switch (data.type) {
      case 'ai-agent':
        return (
          <div className="config-fields">
            <div className="config-section">
              <h4>Model Configuration</h4>
              <select
                value={config.modelConfig?.foundationModel || 'gpt-3.5-turbo'}
                onChange={(e) => handleConfigChange('modelConfig', { ...config.modelConfig, foundationModel: e.target.value })}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
              
              <input
                type="password"
                placeholder="API Key"
                value={config.apiKey || ''}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              />
              
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                placeholder="Temperature (0-1)"
                value={config.modelConfig?.modelParams?.temperature || 0.7}
                onChange={(e) => handleConfigChange('modelConfig', { 
                  ...config.modelConfig, 
                  modelParams: { 
                    ...config.modelConfig?.modelParams,
                    temperature: parseFloat(e.target.value)
                  }
                })}
              />
              
              <input
                type="number"
                step="100"
                min="100"
                max="4000"
                placeholder="Max Tokens"
                value={config.modelConfig?.modelParams?.maxTokens || 1000}
                onChange={(e) => handleConfigChange('modelConfig', { 
                  ...config.modelConfig, 
                  modelParams: { 
                    ...config.modelConfig?.modelParams,
                    maxTokens: parseInt(e.target.value)
                  }
                })}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="node-config">
            {framework.configFields.map(field => (
              <div key={field.name} className="config-field">
                <label>{field.label}:</label>
                {renderConfigField(field)}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`custom-node ${data.type === 'input' ? 'input-node' : ''} ${data.type === 'output' ? 'output-node' : ''} ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle
        type="target"
        position="left"
        isConnectable={isConnectable}
        style={{ visibility: data.type === 'input' ? 'hidden' : 'visible' }}
      />

      {/* Node Header */}
      <div className="node-header">
        <select
          value={data.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="node-type-select"
        >
          {data.type === 'input' || data.type === 'output' ? (
            // For Input/Output nodes, only show Data Flow options
            <>
              <option value="">Select Node Type</option>
              <option value="input">Input Node</option>
              <option value="output">Output Node</option>
            </>
          ) : (
            // For AI agent nodes, only show AI agent options
            <>
              <option value="">Select Agent Type</option>
              {agentFrameworks
                .filter(framework => !['input', 'output'].includes(framework.id))
                .map(framework => (
                  <option key={framework.id} value={framework.id}>
                    {framework.name}
                  </option>
              ))}
            </>
          )}
        </select>
        <button 
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="config-toggle"
        >
          {isConfigOpen ? '▼' : '▶'}
        </button>
      </div>

      {/* Framework Description */}
      {framework && (
        <div className="framework-description">
          {framework.description}
        </div>
      )}

      {/* Configuration Panel */}
      {isConfigOpen && framework && (
        renderConfigFields()
      )}

      {/* Input/Prompt */}
      <div className="node-input-area">
        <textarea
          value={data.inputText || ''}
          onChange={(e) => data.onChange({ ...data, inputText: e.target.value })}
          placeholder={data.type === 'input' ? 'Enter input data or upload files...' : 
                      data.type === 'output' ? 'Output will appear here...' :
                      'Enter your prompt or task description...'}
          className="node-textarea"
          readOnly={data.type === 'output'}
        />
      </div>

      <Handle
        type="source"
        position="right"
        isConnectable={isConnectable}
        style={{ visibility: data.type === 'output' ? 'hidden' : 'visible' }}
      />
    </div>
  );
} 