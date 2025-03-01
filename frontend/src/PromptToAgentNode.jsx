import React, { useState } from 'react';
import { Handle } from 'reactflow';
import './styles.css';

export default function PromptToAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };
  
  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    data.onChange({
      ...data,
      apiKey: e.target.value
    });
  };
  
  const handleModelChange = (e) => {
    setModel(e.target.value);
    data.onChange({
      ...data,
      model: e.target.value
    });
  };
  
  const handleGenerateMultiAgent = async () => {
    if (!prompt) {
      setError('Please enter a prompt describing the multi-agent system you want to create.');
      return;
    }
    
    if (!apiKey) {
      setError('Please enter your API key.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5002/generate-multi-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey,
          model
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Call the callback to generate the flow
      if (data.onGenerateFlow) {
        data.onGenerateFlow(result.flow);
      }
      
      // Update node data with the result
      data.onChange({
        ...data,
        result: result
      });
      
    } catch (error) {
      console.error('Error generating multi-agent system:', error);
      setError(error.message || 'Failed to generate multi-agent system');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className={`custom-node prompt-to-agent ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />
      
      <div className="node-header">
        <div className="node-type-select">Prompt to Multi-Agent</div>
        <button 
          className="config-toggle"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
        >
          {isConfigOpen ? '▼' : '▲'}
        </button>
      </div>
      
      {isConfigOpen && (
        <div className="node-config">
          <div className="config-section">
            <h4>System Description</h4>
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Describe the multi-agent system you want to create. For example: 'I want a system that monitors Twitter for crypto mentions, analyzes sentiment, and posts trading signals to Discord.'"
              className="node-textarea prompt-textarea"
              rows={6}
            />
          </div>
          
          <div className="config-section">
            <h4>AI Model</h4>
            <select 
              value={model} 
              onChange={handleModelChange}
              className="model-select"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            </select>
          </div>
          
          <div className="config-section">
            <h4>API Key</h4>
            <input
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your API key"
              className="node-input api-key-input"
            />
            <div className="api-key-info">
              API key for the selected model (OpenAI or Anthropic)
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGenerateMultiAgent}
            className="generate-button"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Multi-Agent System'}
          </button>
        </div>
      )}
      
      <Handle type="source" position="right" />
    </div>
  );
} 