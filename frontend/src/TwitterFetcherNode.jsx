import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function TwitterFetcherNode({ data }) {
  const [accounts, setAccounts] = useState(data.targetAccounts || []);
  const [newAccount, setNewAccount] = useState('');
  const [bearerToken, setBearerToken] = useState(data.bearerToken || '');
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleBearerTokenChange = (e) => {
    const newToken = e.target.value;
    setBearerToken(newToken);
    data.onChange({
      ...data,
      bearerToken: newToken
    });
  };

  const handleAddAccount = () => {
    if (newAccount && !accounts.includes(newAccount)) {
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      data.onChange({
        ...data,
        bearerToken,
        targetAccounts: updatedAccounts
      });
      setNewAccount('');
    }
  };

  const handleRemoveAccount = (account) => {
    const updatedAccounts = accounts.filter(a => a !== account);
    setAccounts(updatedAccounts);
    data.onChange({
      ...data,
      targetAccounts: updatedAccounts
    });
  };

  useEffect(() => {
    const fetchTweets = async () => {
      if (accounts.length === 0) return;

      try {
        const response = await fetch('http://localhost:5002/fetch-tweets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accounts })
        });

        const result = await response.json();
        
        // Filter tweets or retweets in the last 24 hours and extract only the text
        let recentTweets = [];
        if (Array.isArray(result.tweets)) {
          recentTweets = result.tweets.filter(tweet => {
            if (!tweet.createdAt) return false;
            const tweetTime = new Date(tweet.createdAt).getTime();
            return (Date.now() - tweetTime) <= (24 * 60 * 60 * 1000);
          }).map(tweet => tweet.text);
        }
        
        data.onChange({
          tweets: recentTweets,
          lastFetchTime: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    };

    // Set up interval for fetching tweets
    const interval = setInterval(fetchTweets, data.fetchInterval);
    return () => clearInterval(interval);
  }, [accounts, data.fetchInterval]);

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />
      
      <div className="node-header">
        <select className="node-type-select" value="twitterFetcher" disabled>
          <option value="twitterFetcher">Twitter Fetcher</option>
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
            <h4>Twitter API Configuration</h4>
            <div className="api-config-container">
              <input
                type="password"
                value={bearerToken}
                onChange={handleBearerTokenChange}
                placeholder="Enter Twitter API Bearer Token"
                className="node-input"
              />
            </div>
            
            <h4>Target Twitter Accounts</h4>
            <div className="account-input-container">
              <input
                type="text"
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                placeholder="Enter Twitter handle (without @)"
                className="node-input"
              />
              <button 
                onClick={handleAddAccount}
                className="add-account-btn"
              >
                Add
              </button>
            </div>
            
            <ul className="account-list">
              {accounts.map((account, index) => (
                <li key={index} className="account-item">
                  @{account}
                  <button
                    onClick={() => handleRemoveAccount(account)}
                    className="remove-account-btn"
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