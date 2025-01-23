import React, { useState } from 'react';
import { Handle } from 'reactflow';
import { agentFrameworks } from './agentFrameworks';

export default function CustomNode({ data, isConnectable }) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
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

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle
        type="target"
        position="left"
        isConnectable={isConnectable}
      />

      {/* Node Header */}
      <div className="node-header">
        <select
          value={data.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="node-type-select"
        >
          <option value="">Select Agent Framework</option>
          {agentFrameworks.map(framework => (
            <option key={framework.id} value={framework.id}>
              {framework.name}
            </option>
          ))}
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
        <div className="node-config">
          {framework.configFields.map(field => (
            <div key={field.name} className="config-field">
              <label>{field.label}:</label>
              {renderConfigField(field)}
            </div>
          ))}
        </div>
      )}

      {/* Input/Prompt */}
      <div className="node-input-area">
        <textarea
          value={data.inputText || ''}
          onChange={(e) => data.onChange({ ...data, inputText: e.target.value })}
          placeholder="Enter your prompt or task description..."
          className="node-textarea"
        />
      </div>

      <Handle
        type="source"
        position="right"
        isConnectable={isConnectable}
      />
    </div>
  );
} 