import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';
import { ElizaBot } from './utils/eliza';
import axios from 'axios';

export default function TwitterAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [activeSubAgent, setActiveSubAgent] = useState('pull'); // 'pull', 'post', 'reply'
  const [apiConfig, setApiConfig] = useState({
    bearerToken: data.bearerToken || ''
  });
  const [pullConfig, setPullConfig] = useState({
    prompt: '',
    realTime: false,
    timeLength: '24', // hours
    targetAccounts: [],
    newAccount: '',
    checkCA: false,
    checkCoin: false,
    tweets: [],
    lastFetchTime: null,
    aiPrompt: '', // Add AI prompt field
  });
  const [postConfig, setPostConfig] = useState({
    elizaPrompt: '',
    customRules: '',
    targetAccounts: [],
    newAccount: ''
  });
  const [replyConfig, setReplyConfig] = useState({
    elizaPrompt: '',
    customRules: '',
    targetAccounts: [],
    newAccount: '',
    tweet: '',
    inReplyToTweetId: '',
  });
  const [elizaBot, setElizaBot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Eliza with custom rules when they change
    const postRules = parseRules(postConfig.customRules);
    const replyRules = parseRules(replyConfig.customRules);
    
    setElizaBot({
      post: new ElizaBot(postRules),
      reply: new ElizaBot(replyRules)
    });
  }, [postConfig.customRules, replyConfig.customRules]);

  const parseRules = (rulesText) => {
    try {
      return JSON.parse(rulesText);
    } catch {
      return {};
    }
  };

  const handleApiConfigChange = (value) => {
    setApiConfig({ bearerToken: value });
    data.onChange({
      ...data,
      bearerToken: value
    });
  };

  const handlePullConfigChange = (key, value) => {
    const updatedConfig = {
      ...pullConfig,
      [key]: value
    };
    setPullConfig(updatedConfig);
    data.onChange({
      ...data,
      pullConfig: updatedConfig
    });
  };

  const handlePostConfigChange = (key, value) => {
    const updatedConfig = {
      ...postConfig,
      [key]: value
    };
    setPostConfig(updatedConfig);
    data.onChange({
      ...data,
      postConfig: updatedConfig
    });
  };

  const handleReplyConfigChange = (key, value) => {
    const updatedConfig = {
      ...replyConfig,
      [key]: value
    };
    setReplyConfig(updatedConfig);
    data.onChange({
      ...data,
      replyConfig: updatedConfig
    });
  };

  const handleAddAccount = () => {
    if (pullConfig.newAccount && !pullConfig.targetAccounts.includes(pullConfig.newAccount)) {
      const updatedAccounts = [...pullConfig.targetAccounts, pullConfig.newAccount];
      handlePullConfigChange('targetAccounts', updatedAccounts);
      handlePullConfigChange('newAccount', '');
    }
  };

  const handleRemoveAccount = (account) => {
    const updatedAccounts = pullConfig.targetAccounts.filter(a => a !== account);
    handlePullConfigChange('targetAccounts', updatedAccounts);
  };

  const handleAddPostAccount = () => {
    if (postConfig.newAccount && !postConfig.targetAccounts.includes(postConfig.newAccount)) {
      const updatedAccounts = [...postConfig.targetAccounts, postConfig.newAccount];
      handlePostConfigChange('targetAccounts', updatedAccounts);
      handlePostConfigChange('newAccount', '');
    }
  };

  const handleAddReplyAccount = () => {
    if (replyConfig.newAccount && !replyConfig.targetAccounts.includes(replyConfig.newAccount)) {
      const updatedAccounts = [...replyConfig.targetAccounts, replyConfig.newAccount];
      handleReplyConfigChange('targetAccounts', updatedAccounts);
      handleReplyConfigChange('newAccount', '');
    }
  };

  const handlePostTweet = async (account) => {
    if (!elizaBot || !apiConfig.bearerToken) return;
    
    try {
      const tweet = elizaBot.post.generateTweet(postConfig.elizaPrompt);
      
      const response = await fetch('http://localhost:5002/post-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bearerToken: apiConfig.bearerToken,
          account,
          tweet
        })
      });
      
      const result = await response.json();
      console.log('Posted tweet:', result);
    } catch (error) {
      console.error('Error posting tweet:', error);
      alert(`Error posting tweet: ${error.message}`); // Display error to user
    }
  };

  const handleReplyTweet = async (account, originalTweet) => {
    if (!elizaBot || !apiConfig.bearerToken) return;
    
    try {
      const reply = elizaBot.reply.generateReply(
        originalTweet,
        replyConfig.elizaPrompt
      );
      
      const response = await fetch('http://localhost:5002/reply-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bearerToken: apiConfig.bearerToken,
          account,
          originalTweet,
          reply
        })
      });
      
      const result = await response.json();
      console.log('Posted reply:', result);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(`Error posting reply: ${error.message}`); // Display error to user
    }
  };

  const handlePullTweets = async () => {
    if (!pullConfig.newAccount && pullConfig.targetAccounts.length === 0) {
      alert('Please enter a Twitter username or add accounts to the target list');
      return;
    }

    try {
      console.log("handlePullTweets called. Data:", data);
      setIsLoading(true);
      const response = await axios.post('http://localhost:5002/execute-flow', {
        nodes: [{
          id: data.id,
          type: data.type,
          data: {
            ...data,
            activeSubAgent: 'pull',
            pullConfig: {
              ...data.pullConfig,
              targetAccounts: pullConfig.newAccount ? 
                [...data.pullConfig.targetAccounts, pullConfig.newAccount] : 
                data.pullConfig.targetAccounts
            }
          }
        }]
      });

      if (response.data.results[data.id].tweets.length === 0) {
        alert('No tweets found for the specified account(s)');
      }

      data.onChange({
        ...data,
        pullConfig: {
          ...data.pullConfig,
          tweets: response.data.results[data.id].tweets,
          content: response.data.results[data.id].content,
        }
      });
    } catch (error) {
      console.error('Error pulling tweets:', error);
      alert('Error pulling tweets. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchTweets = async () => {
      if (pullConfig.targetAccounts.length === 0 || !apiConfig.bearerToken) return;

      try {
        const response = await fetch('http://localhost:5002/fetch-tweets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accounts: pullConfig.targetAccounts,
            bearerToken: apiConfig.bearerToken,
            includeRetweets: true,
            includeProfiles: true,
            prompt: pullConfig.prompt,
            checkCA: pullConfig.checkCA,
            checkCoin: pullConfig.checkCoin
          })
        });

        const result = await response.json();

        let recentTweets = [];
        if (Array.isArray(result.tweets)) {
          recentTweets = result.tweets.filter(tweet => {
            if (!tweet.createdAt) return false;
            const tweetTime = new Date(tweet.createdAt).getTime();
            const timeLimit = parseInt(pullConfig.timeLength) * 60 * 60 * 1000;
            return (Date.now() - tweetTime) <= timeLimit;
          }).map(tweet => ({
            type: tweet.isRetweet ? 'retweet' : 'tweet',
            text: tweet.text,
            createdAt: tweet.createdAt,
            author: tweet.author,
            retweetedProfile: tweet.isRetweet ? tweet.retweetedProfile : null
          }));
        }

        handlePullConfigChange('tweets', recentTweets);
        handlePullConfigChange('lastFetchTime', new Date().toISOString());
      } catch (error) {
        console.error('Error fetching tweets:', error);
        alert(`Error fetching tweets: ${error.message}`); // Display error to user
      }
    };

    let interval;
    if (pullConfig.realTime) {
      interval = setInterval(fetchTweets, 60000); // Fetch every minute if realTime is true
    } else {
      fetchTweets(); // Fetch once immediately if realTime is false
    }

    return () => clearInterval(interval);
  }, [pullConfig.targetAccounts, apiConfig.bearerToken, pullConfig.realTime, pullConfig.timeLength, pullConfig.prompt, pullConfig.checkCA, pullConfig.checkCoin]);

  useEffect(() => {
    setPullConfig(prevConfig => ({
      ...prevConfig,
      tweets: data.pullConfig.tweets || [] // Use an empty array as a default
    }));
    console.log("useEffect triggered. data.pullConfig.tweets:", data.pullConfig.tweets);
  }, [data.pullConfig.tweets]);

  return (
    <div className={`custom-node ${isConfigOpen ? 'expanded' : ''}`}>
      <Handle type="target" position="left" />
      
      <div className="node-header">
        <select className="node-type-select" value="twitterAgent" disabled>
          <option value="twitterAgent">Twitter Agent</option>
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
            {/* Global Twitter API Configuration */}
            <div className="api-config-section">
              <h4>Twitter API Configuration</h4>
              <div className="config-field">
                <input
                  type="password"
                  value={apiConfig.bearerToken}
                  onChange={(e) => handleApiConfigChange(e.target.value)}
                  placeholder="Enter Twitter API Bearer Token"
                  className="node-input"
                />
              </div>
            </div>

            <div className="subagent-tabs">
              <button 
                className={`tab-button ${activeSubAgent === 'pull' ? 'active' : ''}`}
                onClick={() => setActiveSubAgent('pull')}
              >
                Pull Tweet
              </button>
              <button 
                className={`tab-button ${activeSubAgent === 'post' ? 'active' : ''}`}
                onClick={() => setActiveSubAgent('post')}
              >
                Post Tweet
              </button>
              <button 
                className={`tab-button ${activeSubAgent === 'reply' ? 'active' : ''}`}
                onClick={() => setActiveSubAgent('reply')}
              >
                Reply Tweet
              </button>
            </div>

            {/* Pull Tweet Configuration */}
            {activeSubAgent === 'pull' && (
              <div className="subagent-config">
                <h4>Pull Tweets</h4>
                
                {/* Add AI Analysis Configuration */}
                <div className="config-field">
                  <label>AI Analysis Prompt</label>
                  <textarea
                    value={pullConfig.aiPrompt}
                    onChange={(e) => handlePullConfigChange('aiPrompt', e.target.value)}
                    placeholder="Enter prompt for AI analysis (e.g., 'Analyze these tweets for sentiment and key topics')"
                    className="node-textarea"
                  />
                </div>

                <div className="config-field">
                  <label>Target Twitter Accounts</label>
                  <div className="account-input-container">
                    <div className="input-group">
                      <input
                        type="text"
                        value={pullConfig.newAccount}
                        onChange={(e) => handlePullConfigChange('newAccount', e.target.value)}
                        placeholder="Enter Twitter username"
                      />
                      <button onClick={handleAddAccount}>Add to List</button>
                      <button 
                        onClick={handlePullTweets}
                        disabled={!pullConfig.newAccount && pullConfig.targetAccounts.length === 0}
                      >
                        Pull Tweets
                      </button>
                    </div>
                  </div>
                  
                  <ul className="account-list">
                    {pullConfig.targetAccounts.map((account, index) => (
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
                </div>
                <div className="config-field">
                  <label>Prompt</label>
                  <textarea
                    value={pullConfig.prompt}
                    onChange={(e) => handlePullConfigChange('prompt', e.target.value)}
                    placeholder="Enter search prompt..."
                    className="node-textarea"
                  />
                </div>
                <div className="config-field checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={pullConfig.checkCA}
                      onChange={(e) => handlePullConfigChange('checkCA', e.target.checked)}
                    />
                    CA (Contract Address)
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={pullConfig.checkCoin}
                      onChange={(e) => handlePullConfigChange('checkCoin', e.target.checked)}
                    />
                    $Coin
                  </label>
                </div>
                <div className="config-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={pullConfig.realTime}
                      onChange={(e) => handlePullConfigChange('realTime', e.target.checked)}
                    />
                    Real-time
                  </label>
                </div>
                <div className="config-field">
                  <label>Time Length (hours)</label>
                  <select
                    value={pullConfig.timeLength}
                    onChange={(e) => handlePullConfigChange('timeLength', e.target.value)}
                    className="node-select"
                  >
                    <option value="1">1 hour</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                  </select>
                </div>
                {pullConfig.lastFetchTime && (
                  <div className="last-fetch-time">
                    Last fetch: {new Date(pullConfig.lastFetchTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}

            {/* Post Tweet Configuration */}
            {activeSubAgent === 'post' && (
              <div className="subagent-config">
                <h4>Post Tweet</h4>
                <div className="config-field">
                  <label>Target Twitter Accounts</label>
                  <div className="account-input-container">
                    <input
                      type="text"
                      value={postConfig.newAccount}
                      onChange={(e) => handlePostConfigChange('newAccount', e.target.value)}
                      placeholder="Enter Twitter handle (without @)"
                      className="node-input"
                    />
                    <button 
                      onClick={handleAddPostAccount}
                      className="add-account-btn"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="account-list">
                    {postConfig.targetAccounts.map((account, index) => (
                      <li key={index} className="account-item">
                        @{account}
                        <button
                          onClick={() => handlePostConfigChange('targetAccounts', 
                            postConfig.targetAccounts.filter(a => a !== account))}
                          className="remove-account-btn"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="config-field">
                  <label>Eliza Prompt</label>
                  <textarea
                    value={postConfig.elizaPrompt}
                    onChange={(e) => handlePostConfigChange('elizaPrompt', e.target.value)}
                    placeholder="Enter Eliza prompt for tweet generation..."
                    className="node-textarea"
                  />
                </div>
                <div className="config-field">
                  <label>Custom Rules</label>
                  <textarea
                    value={postConfig.customRules}
                    onChange={(e) => handlePostConfigChange('customRules', e.target.value)}
                    placeholder="Enter custom rules for Eliza..."
                    className="node-textarea"
                  />
                </div>
                <div className="config-field">
                  <button
                    onClick={() => postConfig.targetAccounts.forEach(handlePostTweet)}
                    className="test-button"
                  >
                    Test Post
                  </button>
                </div>
              </div>
            )}

            {/* Reply Tweet Configuration */}
            {activeSubAgent === 'reply' && (
              <div className="subagent-config">
                <h4>Reply Tweet</h4>
                <div className="config-field">
                  <label>Target Twitter Accounts</label>
                  <div className="account-input-container">
                    <input
                      type="text"
                      value={replyConfig.newAccount}
                      onChange={(e) => handleReplyConfigChange('newAccount', e.target.value)}
                      placeholder="Enter Twitter handle (without @)"
                      className="node-input"
                    />
                    <button 
                      onClick={handleAddReplyAccount}
                      className="add-account-btn"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="account-list">
                    {replyConfig.targetAccounts.map((account, index) => (
                      <li key={index} className="account-item">
                        @{account}
                        <button
                          onClick={() => handleReplyConfigChange('targetAccounts', 
                            replyConfig.targetAccounts.filter(a => a !== account))}
                          className="remove-account-btn"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="config-field">
                  <label>Eliza Prompt</label>
                  <textarea
                    value={replyConfig.elizaPrompt}
                    onChange={(e) => handleReplyConfigChange('elizaPrompt', e.target.value)}
                    placeholder="Enter Eliza prompt for reply generation..."
                    className="node-textarea"
                  />
                </div>
                <div className="config-field">
                  <label>Custom Rules</label>
                  <textarea
                    value={replyConfig.customRules}
                    onChange={(e) => handleReplyConfigChange('customRules', e.target.value)}
                    placeholder="Enter custom rules for Eliza..."
                    className="node-textarea"
                  />
                </div>
                <div className="config-field">
                  <button
                    onClick={() => replyConfig.targetAccounts.forEach(account => 
                      handleReplyTweet(account, "Test tweet to reply to")
                    )}
                    className="test-button"
                  >
                    Test Reply
                  </button>
                </div>
                <div className="reply-config">
                  <div className="input-group">
                    <label>Tweet ID to Reply To:</label>
                    <input
                      type="text"
                      value={replyConfig.inReplyToTweetId}
                      onChange={(e) => setReplyConfig({ ...replyConfig, inReplyToTweetId: e.target.value })}
                      placeholder="Enter Tweet ID"
                    />
                  </div>
                  <div className="input-group">
                    <label>Reply Tweet:</label>
                    <textarea
                      value={replyConfig.tweet}
                      onChange={(e) => setReplyConfig({ ...replyConfig, tweet: e.target.value })}
                      placeholder="Enter your reply tweet here..."
                      className="node-textarea"
                    />
                  </div>
                  <button
                    onClick={() => replyConfig.targetAccounts.forEach(account => 
                      handleReplyTweet(account, replyConfig.tweet)
                    )}
                    className="test-button"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 