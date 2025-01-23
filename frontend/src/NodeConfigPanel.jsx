import React, { useState } from 'react';
import { agentFrameworks } from './agentFrameworks';

export default function NodeConfigPanel({ nodes, setNodes }) {
  const [selectedFramework, setSelectedFramework] = useState(null);

  const handleTypeChange = (nodeId, newType) => {
    const framework = agentFrameworks.find(f => f.id === newType);
    setSelectedFramework(framework);

    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                type: newType,
                framework: framework?.id,
                config: framework ? createDefaultConfig(framework) : {}
              }
            }
          : node
      )
    );
  };

  const createDefaultConfig = (framework) => {
    const config = {};
    framework.configFields.forEach(field => {
      config[field.name] = field.default || 
        (field.type === 'select' ? field.options[0].value : '') ||
        (field.type === 'multiselect' ? [] : '');
    });
    return config;
  };

  const handleInputChange = (nodeId, newInput) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, inputText: newInput } }
          : node
      )
    );
  };

  const handleConfigChange = (nodeId, fieldName, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  [fieldName]: value
                }
              }
            }
          : node
      )
    );
  };

  const renderConfigField = (field, value, onChange) => {
    switch (field.type) {
      case 'select':
        return (
          <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
            {field.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        return (
          <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
            {field.options.map(opt => (
              <div key={opt.value}>
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), opt.value]
                      : (value || []).filter(v => v !== opt.value);
                    onChange(newValue);
                  }}
                />
                <label>{opt.label}</label>
              </div>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || field.default}
            min={field.min}
            max={field.max}
            onChange={(e) => onChange(parseInt(e.target.value))}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div style={{ backgroundColor: '#eee', padding: 10, width: 300 }}>
      <h4>Node Config Panel</h4>
      {nodes.map((node) => (
        <div key={node.id} style={{ border: '1px solid #ccc', marginBottom: 8, padding: 8 }}>
          <div>Node ID: {node.id}</div>
          
          {/* Node Type Selection */}
          <div style={{ marginBottom: 8 }}>
            <label>Node Type:</label>
            <select
              value={node.data.type}
              onChange={(e) => handleTypeChange(node.id, e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="python-llm">Python LLM</option>
              <option value="node-llm">Node LLM</option>
              <optgroup label="Custom Agents">
                {agentFrameworks.map(framework => (
                  <option key={framework.id} value={framework.id}>
                    {framework.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Framework Description */}
          {node.data.framework && (
            <div style={{ 
              fontSize: '0.9em', 
              color: '#666', 
              marginBottom: 8,
              padding: '4px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}>
              {agentFrameworks.find(f => f.id === node.data.framework)?.description}
            </div>
          )}

          {/* Framework Configuration */}
          {node.data.framework && (
            <div style={{ marginBottom: 8 }}>
              <h5>Agent Configuration</h5>
              {agentFrameworks
                .find(f => f.id === node.data.framework)
                ?.configFields.map(field => (
                  <div key={field.name} style={{ marginBottom: 4 }}>
                    <label>{field.label}:</label>
                    {renderConfigField(
                      field,
                      node.data.config?.[field.name],
                      (value) => handleConfigChange(node.id, field.name, value)
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Input Text */}
          <div>
            <label>Input/Prompt:</label>
            <textarea
              rows="2"
              cols="30"
              value={node.data.inputText || ''}
              onChange={(e) => handleInputChange(node.id, e.target.value)}
              placeholder="Enter your prompt or task description..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}