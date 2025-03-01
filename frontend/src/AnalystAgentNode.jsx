import React, { useState, useEffect } from 'react';

import { Handle } from 'reactflow';
import './styles.css';

export default function AnalystAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [contractAddress, setContractAddress] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [openAIApiKey, setOpenAIApiKey] = useState(data.openAIApiKey || '');
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [parameters, setParameters] = useState(() => ({
    mktCap: data.parameters?.mktCap || [0, 1000],       // Market cap in millions
    liquidity: data.parameters?.liquidity || [0, 100],    // Liquidity in millions
    top10: data.parameters?.top10 || [0, 100],        // Top 10 holders percentage
    snipers: data.parameters?.snipers || [0, 70],       // Sniper score (0-70)
    blueChip: data.parameters?.blueChip || [0, 100],     // Blue chip holder percentage
    hasAudit: data.parameters?.hasAudit || false         // Has audit flag
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    if (data.inputs && data.inputs.length > 0) {
      const inputFromTwitter = data.inputs.find(input => input.source.startsWith('node-') && input.output?.content);

      if (inputFromTwitter) {
        setContractAddress(inputFromTwitter.output.content);
      }
    } else {
        setContractAddress('');
    }
  }, [data.inputs]);

  // Expose triggerAnalysis function
  useEffect(() => {
    data.onChange({
      ...data,
      triggerAnalysis: handleRunAnalysis, // Expose the analysis function
      contractAddress: contractAddress // Keep contractAddress updated in data
    });
  }, [contractAddress]); // Depend on contractAddress

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
    // Update the node's data with the new contract address
    data.onChange({
      ...data,
      contractAddress: address
    });
  };

  const handleOpenAIApiKeyChange = (event) => {
    const newKey = event.target.value;
    setOpenAIApiKey(newKey);
    data.onChange({
      ...data,
      openAIApiKey: newKey
    });
  };

  const handleAiPromptChange = (event) => {
    setAiPrompt(event.target.value);
  };

  const handleRunAnalysis = async (currentParameters, currentContractAddress) => {
    const paramsToUse = currentParameters || parameters;
    const addressToUse = currentContractAddress || contractAddress;

    if (!addressToUse) {
      // Don't show an alert here, just return.
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5002/fetch-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress: addressToUse, parameters: paramsToUse })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Ensure result has a properly structured analysisData property
      if (!result.analysisData) {
        result.analysisData = {
          meetsCriteria: false,
          name: "Unknown",
          symbol: "Unknown",
          contractAddress: addressToUse,
          risk: {
            score: 0,
            rugged: false,
            details: []
          }
        };
      }
      
      console.log('Analysis result:', result);

      // Update component state
      setAnalysisData(result.analysisData);
      
      // Update node data
      data.onChange({
        ...data,
        analysisData: result.analysisData,
        output: {
          content: addressToUse,
          summary: result.analysisData.meetsCriteria ? 'Criteria passed' : 'Criteria not met'
        }
      });
    } catch (error) {
      console.error('Error fetching analysis:', error);
      
      // Create a default analysis data object on error
      const defaultAnalysisData = {
        meetsCriteria: false,
        name: "Error",
        symbol: "ERR",
        contractAddress: addressToUse,
        error: error.message,
        risk: {
          score: 0,
          rugged: false,
          details: []
        }
      };
      
      // Update with error state
      setAnalysisData(defaultAnalysisData);
      data.onChange({
        ...data,
        analysisData: defaultAnalysisData,
        output: {
          content: addressToUse,
          summary: 'Error: ' + error.message
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysisFromPrompt = async () => {
    if (!aiPrompt) {
      alert('Please enter an AI prompt');
      return;
    }
    if (!contractAddress) {
      alert('Please enter or connect a Solana token contract address');
      return;
    }
    if (!openAIApiKey) {
      alert('Please enter your OpenAI API key');
      return;
    }

    setIsProcessingPrompt(true);
    try {
      const response = await fetch('http://localhost:5002/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contractAddress, 
          aiPrompt,
          openAIApiKey // Send the API key with the request
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Update parameters based on AI's interpretation
      if (result.parameters) {
        setParameters(prevParams => ({
          ...prevParams,
          ...result.parameters
        }));
        // Also update the node's data
        data.onChange({
          ...data,
          parameters: {
            ...parameters,
            ...result.parameters
          }
        });
      }

      // Now, run the actual analysis with the updated parameters
      handleRunAnalysis(result.parameters, contractAddress);

    } catch (error) {
      console.error('Error analyzing prompt:', error);
      alert('Error analyzing prompt: ' + error.message);
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  // This useEffect is now correctly triggered because App.jsx updates contractAddress
  useEffect(() => {
    handleRunAnalysis(parameters, contractAddress);
  }, [contractAddress, parameters]);

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
            <h4>OpenAI API Key</h4>
            <input
              type="password"
              value={openAIApiKey}
              onChange={handleOpenAIApiKeyChange}
              placeholder="Enter your OpenAI API key"
              className="node-input api-key-input"
            />
            <div className="api-key-info">
              Required for AI prompt functionality
            </div>
          </div>

          <div className="config-section">
            <h4>AI Prompt</h4>
            <textarea
              value={aiPrompt}
              onChange={handleAiPromptChange}
              placeholder="Enter a prompt to control analysis parameters (e.g., 'Find tokens with a market cap between $1M and $10M and high liquidity')"
              className="node-textarea"
            />
            <button 
              onClick={handleRunAnalysisFromPrompt} 
              className="run-analysis-button"
              disabled={isProcessingPrompt}
            >
              {isProcessingPrompt ? 'Processing...' : 'Run Analysis from Prompt'}
            </button>
          </div>

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
                    left: `${parameters.liquidity[0]}%`,
                    width: `${parameters.liquidity[1] - parameters.liquidity[0]}%`
                  }}></div>
                </div>
                <div className="slider-values">
                  <span>{parameters.liquidity[0]}</span>
                  <span>{parameters.liquidity[1]}</span>
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

            <button className="run-analysis-button" disabled>
              Analyzing...
            </button>

            {analysisData && (
              <div className="analysis-results">
                <h4>Analysis Results</h4>
                <div className="result-item">
                  <span>Token Name:</span> {analysisData.name}
                </div>
                <div className="result-item">
                  <span>Symbol:</span> {analysisData.symbol}
                </div>
                <div className="result-item">
                  <span>Meets Criteria:</span> {analysisData.meetsCriteria ? 'Yes' : 'No'}
                </div>
                {analysisData.meetsCriteria && (
                  <div className="result-item">
                    <span>Contract Address:</span> {analysisData.contractAddress}
                  </div>
                )}
                {/* Display Risk Information */}
                {analysisData.risk && (
                    <>
                        <div className="result-item">
                            <span>Risk Score:</span> {analysisData.risk.score}
                        </div>
                        <div className="result-item">
                            <span>Rugged:</span> {analysisData.risk.rugged ? 'Yes' : 'No'}
                        </div>
                        <div className="result-item risk-details">
                            <span>Risk Details:</span>
                            <ul>
                                {analysisData.risk.details.map((detail, index) => (
                                    <li key={index}>
                                        <strong>{detail.name}:</strong> {detail.description} (Level: {detail.level}, Score: {detail.score})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
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