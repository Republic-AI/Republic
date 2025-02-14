import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function TradingAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [settings, setSettings] = useState(data.settings || {
    fixedBuy: '',
    maxBuy: '',
    sellStrategy: 'copy',  // 'copy', 'auto', or 'none'
    gas: '',
    autoSlippage: false,
    antiMEV: false
  });

  useEffect(() => {
    checkConnection();

    if (window.okxwallet) {
      window.okxwallet.on('accountsChanged', handleAccountsChanged);
      window.okxwallet.on('chainChanged', handleChainChanged);
      window.okxwallet.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.okxwallet) {
        window.okxwallet.removeListener('accountsChanged', handleAccountsChanged);
        window.okxwallet.removeListener('chainChanged', handleChainChanged);
        window.okxwallet.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.okxwallet !== 'undefined') {
      try {
        const accounts = await window.okxwallet.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          handleAccountsChanged(accounts);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectOKXWallet = async () => {
    try {
      if (typeof window.okxwallet === 'undefined') {
        window.open('https://www.okx.com/web3', '_blank');
        alert('Please install OKX Wallet extension first');
        return;
      }

      // Request accounts
      const accounts = await window.okxwallet.request({
        method: 'eth_requestAccounts'
      });

      handleAccountsChanged(accounts);

    } catch (error) {
      console.error('Error connecting to OKX wallet:', error);
      if (error.code === 4001) {
        alert('Please accept the connection request in your OKX wallet');
      } else {
        alert('Failed to connect to OKX wallet. Please make sure it is unlocked.');
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
      updateNodeData(accounts[0], true);
    } else {
      handleDisconnect();
    }
  };

  const handleChainChanged = (chainId) => {
    console.log('Chain changed:', chainId);
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    updateNodeData('', false);
  };

  const updateNodeData = (address, connected) => {
    data.onChange({
      ...data,
      walletAddress: address,
      isConnected: connected,
      settings
    });
  };

  const handleSettingChange = (settingName, value) => {
    const updatedSettings = {
      ...settings,
      [settingName]: value
    };
    setSettings(updatedSettings);
    data.onChange({
      ...data,
      settings: updatedSettings,
      walletAddress,
      isConnected
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
    <div className="custom-node">
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
          <div className="wallet-section">
            {!isConnected ? (
              <button
                onClick={connectOKXWallet}
                className="connect-wallet-button"
              >
                Connect OKX Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <div className="wallet-address">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="disconnect-wallet-button"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          <div className="trading-settings">
            <div className="setting-group">
              <label>Fixed Buy Amount (USDC)</label>
              <input
                type="number"
                value={settings.fixedBuy}
                onChange={(e) => handleSettingChange('fixedBuy', e.target.value)}
                placeholder="Enter amount"
                className="node-input"
              />
            </div>

            <div className="setting-group">
              <label>Max Buy Amount (USDC)</label>
              <input
                type="number"
                value={settings.maxBuy}
                onChange={(e) => handleSettingChange('maxBuy', e.target.value)}
                placeholder="Enter max amount"
                className="node-input"
              />
            </div>

            <div className="setting-group">
              <label>Sell Strategy</label>
              <select
                value={settings.sellStrategy}
                onChange={(e) => handleSettingChange('sellStrategy', e.target.value)}
                className="node-select"
              >
                <option value="copy">Copy</option>
                <option value="auto">Auto</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Gas (Gwei)</label>
              <input
                type="number"
                value={settings.gas}
                onChange={(e) => handleSettingChange('gas', e.target.value)}
                placeholder="Enter gas amount"
                className="node-input"
              />
            </div>

            <div className="toggle-group">
              <div className="toggle-item">
                <label>Auto Slippage</label>
                <div 
                  className={`toggle-switch ${settings.autoSlippage ? 'active' : ''}`}
                  onClick={() => handleSettingChange('autoSlippage', !settings.autoSlippage)}
                >
                  <span className="toggle-status">
                    {settings.autoSlippage ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              <div className="toggle-item">
                <label>Anti-MEV</label>
                <div 
                  className={`toggle-switch ${settings.antiMEV ? 'active' : ''}`}
                  onClick={() => handleSettingChange('antiMEV', !settings.antiMEV)}
                >
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