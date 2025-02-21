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
    aiPrompt: data.pullConfig?.aiPrompt || '', // Initialize from data, use optional chaining
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

  // Update useEffect to properly handle KOL list input
  useEffect(() => {
    if (data.inputs && data.inputs.length > 0) {
      // Find input from Twitter KOL List node
      const kolListInput = data.inputs.find(input => 
        input.output?.type === 'twitterKOL' && 
        Array.isArray(input.output?.kolList)
      );

      if (kolListInput) {
        const newTargetAccounts = kolListInput.output.kolList;
        console.log('Received KOL list:', newTargetAccounts);
        
        setPullConfig(prevConfig => ({
          ...prevConfig,
          targetAccounts: newTargetAccounts
        }));
      }
    }
  }, [data.inputs]);

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

  // Add this useEffect to handle external triggers
  useEffect(() => {
    // Attach the handlePullTweets function to the node's data
    data.onChange({
      ...data,
      triggerPull: handlePullTweets,
      // Also include current pullConfig to ensure it's available when triggered
      pullConfig: {
        ...data.pullConfig,
        targetAccounts: pullConfig.targetAccounts
      }
    });
  }, [pullConfig.targetAccounts]); // Add dependency to update when targetAccounts changes

  const handlePullTweets = async () => {
    setIsLoading(true);
    try {
      console.log('Pulling tweets with config:', pullConfig, 'checkCA:', checkCA); // Debug log
      const response = await fetch('http://localhost:5002/execute-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: [{
            id: data.id,
            type: 'twitterAgent',
            data: {
              type: 'twitterAgent',
              activeSubAgent: 'pull',
              bearerToken: apiConfig.bearerToken,
              openAIApiKey: apiConfig.openAIApiKey,
              pullConfig: {
                ...pullConfig,
                targetAccounts: pullConfig.targetAccounts,
                aiPrompt: pullConfig.aiPrompt,
                isOriginalCA: checkCA,
              },
            }
          }],
          edges: []
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const twitterResult = result.results[data.id];

      // Format the output data that will be passed to connected nodes
      const outputToPass = {
        content: twitterResult.content, // Content will be CA if isOriginalCA is true
        summary: twitterResult.summary,
        aiAnalysis: twitterResult.aiAnalysis,
        rawResults: twitterResult.rawResults
      };

      // Update local state for display
      setOutputData(outputToPass);

      // Update node data to pass output to connected nodes
      data.onChange({
        ...data,
        output: outputToPass
      });
      console.log('Updated node data:', { ...data, output: outputToPass });

    } catch (error) {
      console.error('Error pulling tweets:', error);
      alert('Error pulling tweets: ' + error.message);
      setOutputData(null);
      data.onChange({
        ...data,
        output: null,
      });
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
          <div className="config-section">
            <h4>Twitter API Configuration</h4>
            <div className="api-config-container">
              <input
                type="password"
                value={apiConfig.bearerToken}
                onChange={(e) => handleApiConfigChange('bearerToken', e.target.value)}
                placeholder="Enter Twitter API Bearer Token"
                className="node-input"
              />
            </div>
            {/* Add OpenAI API Key Input */}
            <div className="api-config-container">
              <input
                type="password"
                value={apiConfig.openAIApiKey}
                onChange={(e) => handleApiConfigChange('openAIApiKey', e.target.value)}
                placeholder="Enter OpenAI API Key"
                className="node-input"
              />
            </div>
          </div>

          {/* Sub-Agent Selection */}
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
                <input
                  type="number"
                  value={pullConfig.timeLength}
                  onChange={(e) => handlePullConfigChange('timeLength', e.target.value)}
                  placeholder="Enter time length in hours"
                  className="node-input"
                />
              </div>
              <div className="config-field">
                <label>AI Analysis Prompt</label>
                <textarea
                  value={pullConfig.aiPrompt}
                  onChange={(e) => handlePullConfigChange('aiPrompt', e.target.value)}
                  placeholder="Enter a custom prompt for AI analysis..."
                  className="node-textarea"
                />
              </div>
              <div className="config-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={checkCA}
                    onChange={(e) => setCheckCA(e.target.checked)}
                  />
                  Check CA
                </label>
              </div>
              <div className="config-field">
                <label className="checkbox-label">
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
                    {outputData.aiAnalysis && !checkCA && (
                      <div className="ai-analysis-section">
                        <h5>AI Analysis</h5>
                        <p>{outputData.aiAnalysis}</p>
                      </div>
                    )}
                    {outputData.content && (
                      <div className="content-section">
                        <h5>{checkCA ? 'Contract Address' : 'Raw Data'}</h5>
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