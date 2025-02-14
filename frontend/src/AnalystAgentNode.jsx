import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function AnalystAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [contractAddress, setContractAddress] = useState('');
  const [parameters, setParameters] = useState(data.parameters || {
    mktCap: 0,
    liquidity: 0,
    holders: 0,
    snipers: 0,
    blueChip: 0,
    top10: 0,
    hasAudit: false
  });

  const handleParameterChange = (paramName, value) => {
    const updatedParams = {
      ...parameters,
      [paramName]: value
    };
    setParameters(updatedParams);
    data.onChange({
      ...data,
      parameters: updatedParams
    });
  };

  const handleContractAddressChange = (event) => {
    setContractAddress(event.target.value);
    data.onChange({
      ...data,
      contractAddress: event.target.value
    });
  };

  useEffect(() => {
    // No longer fetching on an interval.  Fetch is triggered by button.
  }, []);

  const handleRunAnalysis = async () => {
    try {
      const response = await fetch('http://localhost:5002/fetch-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress, parameters }) // Send contractAddress
      });
      const result = await response.json();
      data.onChange({
        ...data,
        analysisData: result.analysisData, // Expecting analysisData from backend
        lastFetchTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      alert(`Error fetching analysis: ${error.message}`); // Display error
    }
  };

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
            <h4>Contract Address</h4>
            <input
              type="text"
              value={contractAddress}
              onChange={handleContractAddressChange}
              placeholder="Enter contract address"
              className="node-input"
            />
          </div>
          <div className="config-section">
            <h4>Market Analysis Parameters</h4>
            
            <div className="slider-group">
              <label>Market Cap (0 - $1B)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="1000000000"
                  value={parameters.mktCap}
                  onChange={(e) => handleParameterChange('mktCap', Number(e.target.value))}
                  className="node-slider"
                />
                <span className="slider-value">${(parameters.mktCap / 1000000).toFixed(1)}M</span>
              </div>

              <label>Liquidity (0 - $1B)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="1000000000"
                  value={parameters.liquidity}
                  onChange={(e) => handleParameterChange('liquidity', Number(e.target.value))}
                  className="node-slider"
                />
                <span className="slider-value">${(parameters.liquidity / 1000000).toFixed(1)}M</span>
              </div>

              <label>Holders (0 - 5K)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={parameters.holders}
                  onChange={(e) => handleParameterChange('holders', Number(e.target.value))}
                  className="node-slider"
                />
                <span className="slider-value">{parameters.holders}</span>
              </div>

              <label>Snipers (0/70 - 70/70)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="70"
                  value={parameters.snipers}
                  onChange={(e) => handleParameterChange('snipers', Number(e.target.value))}
                  className="node-slider"
                />
                <span className="slider-value">{parameters.snipers}/70</span>
              </div>

              <label>Blue Chip (%)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parameters.blueChip}
                  onChange={(e) => handleParameterChange('blueChip', Number(e.target.value))}
                  className="node-slider"
                />
                <span className="slider-value">{parameters.blueChip}%</span>
              </div>

              <label>Top 10 (%)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parameters.top10}
                  onChange={(e) => handleParameterChange('top10', Number(e.target.value))}
                  className="node-slider"
                />
                <span className="slider-value">{parameters.top10}%</span>
              </div>

              <div className="toggle-container">
                <label>Audit</label>
                <input
                  type="checkbox"
                  checked={parameters.hasAudit}
                  onChange={(e) => handleParameterChange('hasAudit', e.target.checked)}
                  className="node-toggle"
                />
              </div>
            </div>

            <button onClick={handleRunAnalysis} className="run-analysis-button">
              Run Analysis
            </button>
          </div>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 