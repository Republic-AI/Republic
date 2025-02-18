import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';

export default function TwitterFetcherNode({ data }) {
  const [accounts, setAccounts] = useState(data.targetAccounts || []);
  const [newAccount, setNewAccount] = useState('');
  const [bearerToken, setBearerToken] = useState(data.bearerToken || '');
  const [customPrompt, setCustomPrompt] = useState(data.customPrompt || '');
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isOriginalCA, setIsOriginalCA] = useState(data.isOriginalCA || false);

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

  const handleCustomPromptChange = (e) => {
    const newPrompt = e.target.value;
    setCustomPrompt(newPrompt);
    data.onChange({
      ...data,
      customPrompt: newPrompt
    });
  };

  const handleOriginalCAChange = (e) => {
    const checked = e.target.checked;
    setIsOriginalCA(checked);
    data.onChange({
      ...data,
      isOriginalCA: checked
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
          body: JSON.stringify({ 
            accounts,
            bearerToken,
            includeRetweets: true,
            includeProfiles: true
          })
        });

        const result = await response.json();
        
        let recentTweets = [];
        if (Array.isArray(result.tweets)) {
          recentTweets = result.tweets.filter(tweet => {
            if (!tweet.createdAt) return false;
            const tweetTime = new Date(tweet.createdAt).getTime();
            return (Date.now() - tweetTime) <= (24 * 60 * 60 * 1000);
          }).map(tweet => ({
            type: tweet.isRetweet ? 'retweet' : 'tweet',
            text: tweet.text,
            createdAt: tweet.createdAt,
            author: tweet.author,
            retweetedProfile: tweet.isRetweet ? tweet.retweetedProfile : null
          }));
        }
        
        data.onChange({
          ...data,
          tweets: recentTweets,
          lastFetchTime: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    };

    const interval = setInterval(fetchTweets, data.fetchInterval);
    return () => clearInterval(interval);
  }, [accounts, bearerToken, data.fetchInterval]);

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

            <div className="prompt-section">
              <label>Analysis Prompt:</label>
              <textarea
                value={customPrompt}
                onChange={handleCustomPromptChange}
                placeholder="Enter your custom prompt for analyzing the tweets..."
                rows={4}
                className="custom-prompt-input"
              />
            </div>

            <div className="config-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isOriginalCA}
                  onChange={handleOriginalCAChange}
                />
                Original CA Mode (Extract Base58 addresses)
              </label>
            </div>

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