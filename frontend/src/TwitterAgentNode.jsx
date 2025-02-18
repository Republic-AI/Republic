import React, { useState, useEffect } from 'react';
import { Handle } from 'reactflow';
import { ElizaBot } from './utils/eliza';

export default function TwitterAgentNode({ data }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [activeSubAgent, setActiveSubAgent] = useState('pull'); // 'pull', 'post', 'reply'
  const [apiConfig, setApiConfig] = useState({
    bearerToken: data.bearerToken || '',
    openAIApiKey: data.openAIApiKey || '', // Add OpenAI API Key state
  });
  const [pullConfig, setPullConfig] = useState({
    realTime: false,
    timeLength: '24', // hours
    targetAccounts: [],
    newAccount: '',
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
  const [checkCA, setCheckCA] = useState(false);
  const [checkCoin, setCheckCoin] = useState(false);
  const [outputData, setOutputData] = useState(null);

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

  const handleApiConfigChange = (key, value) => {
    setApiConfig({ ...apiConfig, [key]: value });
    data.onChange({
      ...data,
      [key]: value, // Update corresponding key in data
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

  const handleAddPullAccount = () => {
    if (pullConfig.newAccount && !pullConfig.targetAccounts.includes(pullConfig.newAccount)) {
      const updatedAccounts = [...pullConfig.targetAccounts, pullConfig.newAccount];
      handlePullConfigChange('targetAccounts', updatedAccounts);
      handlePullConfigChange('newAccount', '');
    }
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
      alert(`Error posting tweet: ${error.message}`);
    }
  };

  const handleReplyTweet = async (account) => {
    if (!elizaBot || !apiConfig.bearerToken || !replyConfig.tweet) return;

    try {
      const reply = elizaBot.reply.generateReply(replyConfig.tweet, replyConfig.elizaPrompt);

      const response = await fetch('http://localhost:5002/reply-to-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bearerToken: apiConfig.bearerToken,
          account,
          reply,
          originalTweet: replyConfig.tweet,
          inReplyToTweetId: replyConfig.inReplyToTweetId
        })
      });

      const result = await response.json();
      console.log('Posted reply:', result);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(`Error posting reply: ${error.message}`);
    }
  };

  const handlePullTweets = async () => {
    setIsLoading(true);
    try {
      // Construct the AI prompt based on checkboxes
      let aiPrompt = pullConfig.aiPrompt || '';
      if (checkCA) {
        aiPrompt += " Focus on contract addresses.";
      }
      if (checkCoin) {
        aiPrompt += " Focus on cryptocurrency coins.";
      }

      const response = await fetch('http://localhost:5002/execute-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: [
            {
              id: data.id, // Add node ID
              type: 'twitterFetcher',
              data: {
                type: 'twitterFetcher',
                pullConfig: {
                  ...pullConfig,
                  bearerToken: apiConfig.bearerToken,
                  aiPrompt: aiPrompt,
                },
                openAIApiKey: apiConfig.openAIApiKey, // Pass OpenAI API Key
              }
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Pull Tweets Result:", result);

      // Assuming the result structure is { results: { [nodeId]: { ...data } } }
      const nodeResult = result.results[data.id];
      if (nodeResult) {
        setOutputData({
          summary: nodeResult.summary,
          aiAnalysis: nodeResult.aiAnalysis,
          content: nodeResult.content,
        });

        // Update lastFetchTime in pullConfig
        handlePullConfigChange('lastFetchTime', new Date().toISOString());
        handlePullConfigChange('tweets', nodeResult.rawResults || []);
      } else {
        console.warn("No results found for Twitter Fetcher node.");
        setOutputData(null);
      }

    } catch (error) {
      console.error('Error pulling tweets:', error);
      setOutputData({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`custom-node twitter-agent ${isConfigOpen ? 'expanded' : ''}`}>
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
          {/* API Configuration */}
          <div className="api-config-section">
            <h4>API Configuration</h4>
            <div className="config-field">
              <input
                type="password"
                value={apiConfig.bearerToken}
                onChange={(e) => handleApiConfigChange('bearerToken', e.target.value)}
                placeholder="Enter Twitter API Bearer Token"
                className="node-input"
              />
            </div>
            <div className="config-field">
              <input
                type="password"
                value={apiConfig.openAIApiKey}
                onChange={(e) => handleApiConfigChange('openAIApiKey', e.target.value)}
                placeholder="Enter OpenAI API Key"
                className="node-input"
              />
            </div>
          </div>

          {/* Subagent Selection */}
          <div className="subagent-selection">
            <button
              onClick={() => setActiveSubAgent('pull')}
              className={activeSubAgent === 'pull' ? 'active' : ''}
            >
              Pull Tweets
            </button>
            <button
              onClick={() => setActiveSubAgent('post')}
              className={activeSubAgent === 'post' ? 'active' : ''}
            >
              Post Tweet
            </button>
            <button
              onClick={() => setActiveSubAgent('reply')}
              className={activeSubAgent === 'reply' ? 'active' : ''}
            >
              Reply to Tweet
            </button>
          </div>

          {/* Pull Tweets Configuration */}
          {activeSubAgent === 'pull' && (
            <div className="subagent-config">
              <h4>Pull Tweets</h4>
              <div className="config-field">
                <label>Target Twitter Accounts</label>
                <div className="account-input-container">
                  <input
                    type="text"
                    value={pullConfig.newAccount}
                    onChange={(e) => handlePullConfigChange('newAccount', e.target.value)}
                    placeholder="Enter Twitter handle (without @)"
                    className="node-input"
                  />
                  <button
                    onClick={handleAddPullAccount}
                    className="add-account-btn"
                  >
                    Add
                  </button>
                </div>
                <ul className="account-list">
                  {pullConfig.targetAccounts.map((account, index) => (
                    <li key={index} className="account-item">
                      @{account}
                      <button
                        onClick={() => handlePullConfigChange('targetAccounts',
                          pullConfig.targetAccounts.filter(a => a !== account))}
                        className="remove-account-btn"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="config-field">
                <label>Time Length (hours)</label>
                <select
                  value={pullConfig.timeLength}
                  onChange={(e) => handlePullConfigChange('timeLength', e.target.value)}
                  className="node-select"
                >
                  <option value="1">1 hour</option>
                  <option value="3">3 hours</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                </select>
              </div>
              <div className="config-field">
                <label>AI Analysis Prompt</label>
                <textarea
                  value={pullConfig.aiPrompt}
                  onChange={(e) => handlePullConfigChange('aiPrompt', e.target.value)}
                  placeholder="Enter prompt for AI analysis..."
                  className="node-textarea"
                />
              </div>
              <div className="config-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={checkCA}
                    onChange={(e) => setCheckCA(e.target.checked)}
                  />
                  Check Contract Addresses
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={checkCoin}
                    onChange={(e) => setCheckCoin(e.target.checked)}
                  />
                  Check Coins
                </label>
              </div>
              <div className="config-field">
                <button onClick={handlePullTweets} className="test-button">
                  Test Pull
                </button>
                {isLoading && <p>Loading...</p>}
                {outputData && (
                  <div className="twitter-output">
                    {outputData.summary && (
                      <div className="summary-section">
                        <h5>Summary</h5>
                        <p>{outputData.summary}</p>
                      </div>
                    )}
                    {outputData.aiAnalysis && (
                      <div className="ai-analysis-section">
                        <h5>AI Analysis</h5>
                        <p>{outputData.aiAnalysis}</p>
                      </div>
                    )}
                    {outputData.content && (
                      <div className="content-section">
                        <h5>Raw Data</h5>
                        <pre className="content-pre">
                          {outputData.content}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                {pullConfig.lastFetchTime && (
                  <div className="last-fetch-time">
                    Last fetch: {new Date(pullConfig.lastFetchTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
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
                <label>Original Tweet</label>
                <textarea
                  value={replyConfig.tweet}
                  onChange={(e) => handleReplyConfigChange('tweet', e.target.value)}
                  placeholder="Enter the original tweet to reply to..."
                  className="node-textarea"
                />
              </div>
              <div className="config-field">
                <label>In Reply To Tweet ID</label>
                <input
                  type="text"
                  value={replyConfig.inReplyToTweetId}
                  onChange={(e) => handleReplyConfigChange('inReplyToTweetId', e.target.value)}
                  placeholder="Enter the ID of the tweet to reply to"
                  className="node-input"
                />
              </div>
              <div className="config-field">
                <button
                  onClick={() => replyConfig.targetAccounts.forEach(handleReplyTweet)}
                  className="test-button"
                >
                  Test Reply
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Handle type="source" position="right" />
    </div>
  );
} 