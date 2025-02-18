import React, { useState } from 'react';
import { Handle } from 'reactflow';
import './styles.css';

export default function AnalystAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [contractAddress, setContractAddress] = useState('');
  const [parameters, setParameters] = useState(() => ({
    mktCap: data.parameters?.mktCap || [0, 1000],       // Market cap in millions
    liquidity: data.parameters?.liquidity || [0, 100],    // Liquidity in millions
    holders: data.parameters?.holders || [0, 10000],    // Number of holders
    snipers: data.parameters?.snipers || [0, 70],       // Sniper score (0-70)
    blueChip: data.parameters?.blueChip || [0, 100],     // Blue chip holder percentage
    top10: data.parameters?.top10 || [0, 100],        // Top 10 holders percentage
    hasAudit: data.parameters?.hasAudit || false         // Has audit flag
  }));

  const handleRangeChange = (paramName, value) => {
    const updatedParams = {
      ...parameters,
      [paramName]: value,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      data.onChange({
        ...data,
        analysisData: result.analysisData
      });
    } catch (error) {
      console.error('Error fetching analysis:', error);
      alert('Error fetching analysis: ' + error.message);
      data.onChange({
        ...data,
        analysisData: null
      });
    }
  };

  return (
    <div className={`custom-node analyst-agent ${isConfigOpen ? 'expanded' : ''}`}>
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
              placeholder="Enter Solana token contract address"
              className="node-input"
            />
          </div>

          <div className="config-section">
            <h4>Analysis Parameters</h4>
            <div className="parameters-grid">
              <div className="slider-container">
                <label>Market Cap (Millions)</label>
                <div className="range-slider">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={parameters.mktCap[0]}
                    onChange={(e) => handleRangeChange('mktCap', [Number(e.target.value), parameters.mktCap[1]])}
                    className="slider"
                    style={{zIndex:2}}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={parameters.mktCap[1]}
                    onChange={(e) => handleRangeChange('mktCap', [parameters.mktCap[0], Number(e.target.value)])}
                    className="slider"
                    style={{zIndex:1}}
                  />
                  <div className="range-between" style={{
                    left: `${(parameters.mktCap[0] / 1000) * 100}%`,
                    width: `${((parameters.mktCap[1] - parameters.mktCap[0]) / 1000) * 100}%`
                  }}></div>
                </div>
                <div className="slider-values">
                  <span>{parameters.mktCap[0]}</span>
                  <span>{parameters.mktCap[1]}</span>
                </div>
              </div>

              <div className="slider-container">
                <label>Liquidity (Millions)</label>
                <div className="range-slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parameters.liquidity[0]}
                    onChange={(e) => handleRangeChange('liquidity', [Number(e.target.value), parameters.liquidity[1]])}
                    className="slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parameters.liquidity[1]}
                    onChange={(e) => handleRangeChange('liquidity', [parameters.liquidity[0], Number(e.target.value)])}
                    className="slider"
                  />
                  <div className="range-between" style={{
                    left: `${(parameters.liquidity[0] / 100) * 100}%`,
                    width: `${((parameters.liquidity[1] - parameters.liquidity[0]) / 100) * 100}%`
                  }}></div>
                </div>
                <div className="slider-values">
                  <span>{parameters.liquidity[0]}</span>
                  <span>{parameters.liquidity[1]}</span>
                </div>
              </div>

              <div className="slider-container">
                <label>Holders</label>
                <div className="range-slider">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={parameters.holders[0]}
                    onChange={(e) => handleRangeChange('holders', [Number(e.target.value), parameters.holders[1]])}
                    className="slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={parameters.holders[1]}
                    onChange={(e) => handleRangeChange('holders', [parameters.holders[0], Number(e.target.value)])}
                    className="slider"
                  />
                  <div className="range-between" style={{
                    left: `${(parameters.holders[0] / 10000) * 100}%`,
                    width: `${((parameters.holders[1] - parameters.holders[0]) / 10000) * 100}%`
                  }}></div>
                </div>
                <div className="slider-values">
                  <span>{parameters.holders[0]}</span>
                  <span>{parameters.holders[1]}</span>
                </div>
              </div>

              <div className="slider-container">
                <label>Snipers (0-70)</label>
                <div className="range-slider">
                  <input
                    type="range"
                    min="0"
                    max="70"
                    value={parameters.snipers[0]}
                    onChange={(e) => handleRangeChange('snipers', [Number(e.target.value), parameters.snipers[1]])}
                    className="slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="70"
                    value={parameters.snipers[1]}
                    onChange={(e) => handleRangeChange('snipers', [parameters.snipers[0], Number(e.target.value)])}
                    className="slider"
                  />
                  <div className="range-between" style={{
                    left: `${(parameters.snipers[0] / 70) * 100}%`,
                    width: `${((parameters.snipers[1] - parameters.snipers[0]) / 70) * 100}%`
                  }}></div>
                </div>
                <div className="slider-values">
                  <span>{parameters.snipers[0]}</span>
                  <span>{parameters.snipers[1]}</span>
                </div>
              </div>

              <div className="slider-container">
                <label>Blue Chip Holders (%)</label>
                <div className="range-slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parameters.blueChip[0]}
                    onChange={(e) => handleRangeChange('blueChip', [Number(e.target.value), parameters.blueChip[1]])}
                    className="slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parameters.blueChip[1]}
                    onChange={(e) => handleRangeChange('blueChip', [parameters.blueChip[0], Number(e.target.value)])}
                    className="slider"
                  />
                  <div className="range-between" style={{
                    left: `${parameters.blueChip[0]}%`,
                    width: `${parameters.blueChip[1] - parameters.blueChip[0]}%`
                  }}></div>
                </div>
                <div className="slider-values">
                  <span>{parameters.blueChip[0]}</span>
                  <span>{parameters.blueChip[1]}</span>
                </div>
              </div>

              <div className="slider-container">
                <label>Top 10 Holders (%)</label>
                <div className="range-slider">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parameters.top10[0]}
                    onChange={(e) => handleRangeChange('top10', [Number(e.target.value), parameters.top10[1]])}
                    className="slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parameters.top10[1]}
                    onChange={(e) => handleRangeChange('top10', [parameters.top10[0], Number(e.target.value)])}
                    className="slider"
                  />
                  <div className="range-between" style={{
                    left: `${parameters.top10[0]}%`,
                    width: `${parameters.top10[1] - parameters.top10[0]}%`
                  }}></div>
                </div>
                <div className="slider-values">
                  <span>{parameters.top10[0]}</span>
                  <span>{parameters.top10[1]}</span>
                </div>
              </div>

              <div className="toggle-container">
                <label>Audit</label>
                <input
                  type="checkbox"
                  checked={parameters.hasAudit}
                  onChange={(e) => handleRangeChange('hasAudit', e.target.checked)}
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