import React, { useState } from 'react';
import { Handle } from 'reactflow';

export default function AnalystAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [contractAddress, setContractAddress] = useState('');
  const [parameters, setParameters] = useState(data.parameters || {
    mktCap: 0,           // Market cap in millions
    liquidity: 0,        // Liquidity in millions
    holders: 0,          // Number of holders
    snipers: 0,          // Sniper score (0-70)
    blueChip: 0,         // Blue chip holder percentage
    top10: 0,            // Top 10 holders percentage
    hasAudit: false      // Has audit flag
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
    const address = event.target.value;
    setContractAddress(address);
    data.onChange({
      ...data,
      contractAddress: address
    });
  };

  const handleRunAnalysis = async () => {
    if (!contractAddress) {
      alert('Please enter a Solana token contract address');
      return;
    }

    try {
      const response = await fetch('http://localhost:5002/fetch-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress, parameters })
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const result = await response.json();
      
      if (result.error) {
        alert(`Analysis error: ${result.error}`);
        return;
      }

      // Update node data with analysis results
      data.onChange({
        ...data,
        analysisData: result.analysisData,
        lastAnalysisTime: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error running analysis:', error);
      alert(`Error running analysis: ${error.message}`);
    }
  };

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />
      
      <div className="node-header">
        <select className="node-type-select" value="analystAgent" disabled>
          <option value="analystAgent">Token Analyst</option>
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
            <h4>Token Contract Address</h4>
            <input
              type="text"
              value={contractAddress}
              onChange={handleContractAddressChange}
              placeholder="Enter Solana token address"
              className="node-input"
            />
          </div>

          <div className="config-section">
            <h4>Analysis Parameters</h4>
            
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

            {data.analysisData && (
              <div className="analysis-results">
                <h4>Analysis Results</h4>
                <div className="result-item">
                  <span>Token Name:</span> {data.analysisData.name}
                </div>
                <div className="result-item">
                  <span>Symbol:</span> {data.analysisData.symbol}
                </div>
                <div className="result-item">
                  <span>Meets Criteria:</span> {data.analysisData.meetsCriteria ? 'Yes' : 'No'}
                </div>
                {data.analysisData.meetsCriteria && (
                  <div className="result-item">
                    <span>Contract Address:</span> {data.analysisData.contractAddress}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 