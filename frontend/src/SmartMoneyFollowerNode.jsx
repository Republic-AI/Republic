import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function SmartMoneyFollowerNode({ data }) {
  const [wallets, setWallets] = useState(data.targetWallets || []);
  const [newWallet, setNewWallet] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleAddWallet = () => {
    if (newWallet && !wallets.includes(newWallet)) {
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      data.onChange({
        ...data,
        targetWallets: updatedWallets
      });
      setNewWallet('');
    }
  };

  const handleRemoveWallet = (wallet) => {
    const updatedWallets = wallets.filter(w => w !== wallet);
    setWallets(updatedWallets);
    data.onChange({
      ...data,
      targetWallets: updatedWallets
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (wallets.length === 0) return;
      try {
        const response = await fetch('http://localhost:5002/fetch-smart-money-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallets })
        });
        const result = await response.json();
        data.onChange({
          ...data,
          transactions: result.transactions,
          lastFetchTime: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching smart money transactions:', error);
      }
    };

    const interval = setInterval(fetchTransactions, data.fetchInterval);
    return () => clearInterval(interval);
  }, [wallets, data.fetchInterval]);

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />
      
      <div className="node-header">
        <select className="node-type-select" value="smartMoneyFollower" disabled>
          <option value="smartMoneyFollower">Smart Money Follower</option>
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
            <h4>Target Smart Money</h4>
            <div className="wallet-input-container">
              <input
                type="text"
                value={newWallet}
                onChange={(e) => setNewWallet(e.target.value)}
                placeholder="Enter smart money address"
                className="node-input"
              />
              <button 
                onClick={handleAddWallet}
                className="add-wallet-btn"
              >
                Add
              </button>
            </div>
            
            <ul className="wallet-list">
              {wallets.map((wallet, index) => (
                <li key={index} className="wallet-item">
                  {wallet}
                  <button
                    onClick={() => handleRemoveWallet(wallet)}
                    className="remove-wallet-btn"
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