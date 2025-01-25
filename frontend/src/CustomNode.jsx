import React, { useState } from 'react';
import { Handle } from 'reactflow';
import { agentFrameworks } from './agentFrameworks';

const defaultConfig = {
  apiKeys: {
    openai: '',
    anthropic: '',
    serpapi: '',
    google: ''
  },
  foundationModel: 'gpt-3.5-turbo',
  modelParams: {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1
  }
};

// Configuration fields for different node types
const NODE_CONFIGS = {
  'eliza': {
    fields: {
      // Therapist Personality
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
      // Response Style
      reflectionLevel: {
        type: 'slider',
        label: 'Reflection Level',
        min: 0,
        max: 10,
        default: 7,
        tooltip: 'How much to reflect user statements back'
      },
      empathyLevel: {
        type: 'slider',
        label: 'Empathy Level',
        min: 0,
        max: 10,
        default: 8,
        tooltip: 'Level of emotional understanding to express'
      },
      // Memory Configuration
      memoryType: {
        type: 'select',
        label: 'Memory Type',
        options: ['session', 'emotional', 'contextual'],
        default: 'emotional',
        tooltip: 'Type of memory to maintain'
      },
      contextWindow: {
        type: 'number',
        label: 'Context Window',
        min: 1,
        max: 10,
        default: 5,
        tooltip: 'Number of previous exchanges to consider'
      },
      // Social Platform Integration
      platforms: {
        type: 'group',
        label: 'Social Platforms',
        fields: {
          twitter: {
            type: 'group',
            label: 'Twitter',
            fields: {
              enabled: {
                type: 'boolean',
                label: 'Enable Twitter',
                default: false,
                tooltip: 'Enable posting to Twitter'
              },
              apiKey: {
                type: 'password',
                label: 'API Key',
                tooltip: 'Twitter API Key'
              },
              autoPost: {
                type: 'boolean',
                label: 'Auto Post',
                default: false,
                tooltip: 'Automatically post responses to Twitter'
              }
            }
          },
          discord: {
            type: 'group',
            label: 'Discord',
            fields: {
              enabled: {
                type: 'boolean',
                label: 'Enable Discord',
                default: false,
                tooltip: 'Enable posting to Discord'
              },
              botToken: {
                type: 'password',
                label: 'Bot Token',
                tooltip: 'Discord Bot Token'
              },
              channels: {
                type: 'array',
                label: 'Channel IDs',
                itemType: 'text',
                tooltip: 'Discord Channel IDs to post to'
              },
              autoPost: {
                type: 'boolean',
                label: 'Auto Post',
                default: false,
                tooltip: 'Automatically post responses to Discord'
              }
            }
          }
        }
      }
    }
  }
  // ... other node types ...
};

export default function CustomNode({ data, isConnectable }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState(data.config || defaultConfig);
  const framework = data.framework ? agentFrameworks.find(f => f.id === data.framework) : null;

  const handleTypeChange = (newType) => {
    const framework = agentFrameworks.find(f => f.id === newType);
    const config = framework ? createDefaultConfig(framework) : {};
    data.onChange({
      ...data,
      type: newType,
      framework: framework?.id,
      config
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
      } else {
        config[field.name] = field.default || 
          (field.type === 'select' ? field.options[0].value : '') ||
          (field.type === 'multiselect' ? [] : '');
      }
    });
    return config;
  };

  const handleConfigChange = (fieldName, value, subField = null) => {
    if (subField) {
      data.onChange({
        ...data,
        config: {
          ...data.config,
          [fieldName]: {
            ...data.config[fieldName],
            [subField]: value
          }
        }
      });
    } else {
      data.onChange({
        ...data,
        config: {
          ...data.config,
          [fieldName]: value
        }
      });
    }
  };

  const renderConfigField = (field) => {
    const value = data.config?.[field.name];
    
    // Check if field should be shown based on conditions
    if (field.showWhen) {
      const conditionField = data.config?.[field.showWhen.field];
      const conditionValues = Array.isArray(field.showWhen.values) 
        ? field.showWhen.values 
        : [field.showWhen.value];
      
      if (!conditionValues.includes(conditionField)) {
        return null;
      }
    }

    switch (field.type) {
      case 'select':
        return (
          <select 
            value={value || ''} 
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            className="node-select"
          >
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        return (
          <div className="node-multiselect">
            {field.options.map(opt => (
              <div key={opt.value} className="node-checkbox">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), opt.value]
                      : (value || []).filter(v => v !== opt.value);
                    handleConfigChange(field.name, newValue);
                  }}
                />
                <label>{opt.label}</label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              handleConfigChange(field.name, files);
            }}
            accept={field.accept}
            multiple={field.multiple}
            className="node-file-input"
          />
        );

      case 'json':
        return (
          <textarea
            value={value || field.placeholder || ''}
            onChange={(e) => {
              try {
                // Validate JSON but store as string
                JSON.parse(e.target.value);
                handleConfigChange(field.name, e.target.value);
              } catch (err) {
                // Still update even if invalid JSON
                handleConfigChange(field.name, e.target.value);
              }
            }}
            placeholder={field.placeholder}
            className="node-textarea json-textarea"
            rows={5}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="node-textarea config-textarea"
          />
        );

      case 'apiKeys':
        return (
          <div className="api-keys-container">
            {field.fields.map(apiField => (
              <div key={apiField.name} className="api-key-field">
                <label>{apiField.label}:</label>
                <input
                  type="password"
                  value={value?.[apiField.name] || ''}
                  onChange={(e) => handleConfigChange(field.name, e.target.value, apiField.name)}
                  className="node-input"
                  placeholder="Enter API key"
                />
              </div>
            ))}
          </div>
        );

      case 'modelParams':
        return (
          <div className="model-params-container">
            {field.params.map(param => (
              <div key={param.name} className="param-field">
                <label>{param.label}:</label>
                <input
                  type="number"
                  value={value?.[param.name] || param.default}
                  onChange={(e) => handleConfigChange(field.name, parseFloat(e.target.value), param.name)}
                  min={param.min}
                  max={param.max}
                  step={param.step || 1}
                  className="node-input"
                />
              </div>
            ))}
          </div>
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
              <h4>API Keys</h4>
              <input
                type="password"
                placeholder="OpenAI API Key"
                value={config.apiKeys?.openai || ''}
                onChange={(e) => handleConfigChange('apiKeys.openai', e.target.value)}
              />
              <input
                type="password"
                placeholder="Anthropic API Key"
                value={config.apiKeys?.anthropic || ''}
                onChange={(e) => handleConfigChange('apiKeys.anthropic', e.target.value)}
              />
            </div>
            
            <div className="config-section">
              <h4>Model Configuration</h4>
              <select
                value={config.foundationModel || 'gpt-3.5-turbo'}
                onChange={(e) => handleConfigChange('foundationModel', e.target.value)}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-2">Claude 2</option>
                <option value="claude-instant">Claude Instant</option>
              </select>
              
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                placeholder="Temperature (0-1)"
                value={config.modelParams?.temperature || 0.7}
                onChange={(e) => handleConfigChange('modelParams.temperature', parseFloat(e.target.value))}
              />
              
              <input
                type="number"
                step="100"
                min="100"
                max="4000"
                placeholder="Max Tokens"
                value={config.modelParams?.maxTokens || 1000}
                onChange={(e) => handleConfigChange('modelParams.maxTokens', parseInt(e.target.value))}
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