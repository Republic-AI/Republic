import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function AnalystAgentNode({ data }) {
  const [analysisParameters, setAnalysisParameters] = useState(data.analysisParameters || []);
  const [newParameter, setNewParameter] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleAddParameter = () => {
    if (newParameter && !analysisParameters.includes(newParameter)) {
      const updatedParams = [...analysisParameters, newParameter];
      setAnalysisParameters(updatedParams);
      data.onChange({
        ...data,
        analysisParameters: updatedParams
      });
      setNewParameter('');
    }
  };

  const handleRemoveParameter = (parameter) => {
    const updatedParams = analysisParameters.filter(item => item !== parameter);
    setAnalysisParameters(updatedParams);
    data.onChange({
      ...data,
      analysisParameters: updatedParams
    });
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (analysisParameters.length === 0) return;
      try {
        const response = await fetch('http://localhost:5002/fetch-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parameters: analysisParameters })
        });
        const result = await response.json();
        data.onChange({
          ...data,
          analysisData: result.analysisData,
          lastFetchTime: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      }
    };

    const interval = setInterval(fetchAnalysis, data.fetchInterval);
    return () => clearInterval(interval);
  }, [analysisParameters, data.fetchInterval]);

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />
      
      <div className="node-header">
        <select className="node-type-select" value="analystAgent" disabled>
          <option value="analystAgent">Analyst Agent</option>
        </select>
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
            <h4>Analysis Parameters</h4>
            <div className="parameter-input-container">
              <input 
                type="text"
                value={newParameter}
                onChange={(e) => setNewParameter(e.target.value)}
                placeholder="Enter analysis parameter"
                className="node-input"
              />
              <button 
                onClick={handleAddParameter}
                className="add-parameter-btn"
              >
                Add
              </button>
            </div>
            
            <ul className="parameter-list">
              {analysisParameters.map((param, index) => (
                <li key={index} className="parameter-item">
                  {param}
                  <button
                    onClick={() => handleRemoveParameter(param)}
                    className="remove-parameter-btn"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            {data.lastFetchTime && (
              <div className="last-fetch-time">
                Last fetch: {new Date(data.lastFetchTime).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 