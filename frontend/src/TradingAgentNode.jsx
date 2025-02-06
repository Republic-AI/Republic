import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function TradingAgentNode({ data }) {
  const [tradingPairs, setTradingPairs] = useState(data.tradingPairs || []);
  const [newPair, setNewPair] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleAddPair = () => {
    if (newPair && !tradingPairs.includes(newPair)) {
      const updatedPairs = [...tradingPairs, newPair];
      setTradingPairs(updatedPairs);
      data.onChange({
        ...data,
        tradingPairs: updatedPairs
      });
      setNewPair('');
    }
  };

  const handleRemovePair = (pair) => {
    const updatedPairs = tradingPairs.filter(item => item !== pair);
    setTradingPairs(updatedPairs);
    data.onChange({
      ...data,
      tradingPairs: updatedPairs
    });
  };

  useEffect(() => {
    const fetchTradingData = async () => {
      if (tradingPairs.length === 0) return;
      try {
        const response = await fetch('http://localhost:5002/fetch-trading-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradingPairs })
        });
        const result = await response.json();
        data.onChange({
          ...data,
          tradingData: result.tradingData,
          lastFetchTime: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching trading data:', error);
      }
    };

    const interval = setInterval(fetchTradingData, data.fetchInterval);
    return () => clearInterval(interval);
  }, [tradingPairs, data.fetchInterval]);

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />

      <div className="node-header">
        <select className="node-type-select" value="tradingAgent" disabled>
          <option value="tradingAgent">Trading Agent</option>
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
            <h4>Target Trading Pairs</h4>
            <div className="pair-input-container">
              <input 
                type="text" 
                value={newPair} 
                onChange={(e) => setNewPair(e.target.value)} 
                placeholder="Enter trading pair, e.g., BTC/USD" 
                className="node-input" 
              />
              <button onClick={handleAddPair} className="add-pair-btn">
                Add
              </button>
            </div>
            <ul className="pair-list">
              {tradingPairs.map((pair, index) => (
                <li key={index} className="pair-item">
                  {pair}
                  <button onClick={() => handleRemovePair(pair)} className="remove-pair-btn">
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