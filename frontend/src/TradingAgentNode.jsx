import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function TradingAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [settings, setSettings] = useState(data.settings || {
    fixedBuy: '',
    maxBuy: '',
    sellStrategy: 'copy',  // 'copy', 'auto', or 'none'
    gas: '',
    autoSlippage: false,
    antiMEV: false
  });

  const handleSettingChange = (setting, value) => {
    const updatedSettings = {
      ...settings,
      [setting]: value
    };
    setSettings(updatedSettings);
    data.onChange({
      ...data,
      settings: updatedSettings
    });
  };

  useEffect(() => {
    const fetchTradingData = async () => {
      try {
        const response = await fetch('http://localhost:5002/fetch-trading-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings })
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
  }, [settings, data.fetchInterval]);

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
            <h4>Trading Settings</h4>
            <div className="trading-settings">
              {/* Buy Settings */}
              <div className="setting-group">
                <label>Fixed Buy</label>
                <input
                  type="text"
                  value={settings.fixedBuy}
                  onChange={(e) => handleSettingChange('fixedBuy', e.target.value)}
                  placeholder="Enter fixed buy amount"
                  className="node-input"
                />
              </div>

              <div className="setting-group">
                <label>Max Buy</label>
                <input
                  type="text"
                  value={settings.maxBuy}
                  onChange={(e) => handleSettingChange('maxBuy', e.target.value)}
                  placeholder="Enter max buy amount"
                  className="node-input"
                />
              </div>

              {/* Sell Strategy */}
              <div className="setting-group">
                <label>Sell Strategy</label>
                <select
                  value={settings.sellStrategy}
                  onChange={(e) => handleSettingChange('sellStrategy', e.target.value)}
                  className="node-select"
                >
                  <option value="copy">Copy Sell</option>
                  <option value="auto">Auto Sell</option>
                  <option value="none">Not Sell</option>
                </select>
              </div>

              {/* Gas Settings */}
              <div className="setting-group">
                <label>Gas</label>
                <input
                  type="text"
                  value={settings.gas}
                  onChange={(e) => handleSettingChange('gas', e.target.value)}
                  placeholder="Enter gas amount"
                  className="node-input"
                />
              </div>

              {/* Toggles */}
              <div className="toggle-group">
                <div className="toggle-container">
                  <label>Auto Slippage</label>
                  <input
                    type="checkbox"
                    checked={settings.autoSlippage}
                    onChange={(e) => handleSettingChange('autoSlippage', e.target.checked)}
                    className="node-toggle"
                  />
                </div>

                <div className="toggle-container">
                  <label>Anti-MEV</label>
                  <input
                    type="checkbox"
                    checked={settings.antiMEV}
                    onChange={(e) => handleSettingChange('antiMEV', e.target.checked)}
                    className="node-toggle"
                  />
                  <span className="toggle-status">
                    {settings.antiMEV ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 