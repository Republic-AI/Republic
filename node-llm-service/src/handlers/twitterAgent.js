const axios = require('axios');

async function twitterAgentHandler(node) {
  const { bearerToken, pullConfig, postConfig, replyConfig } = node.data;
  
  if (!bearerToken) {
    return {
      error: "No Twitter API Bearer Token provided"
    };
  }

  // Handle different subagent operations based on the active one
  switch (node.data.activeSubAgent) {
    case 'post':
      return handlePostTweet(bearerToken, postConfig);
    case 'reply':
      return handleReplyTweet(bearerToken, replyConfig);
    default:
      return { error: "Invalid subagent type" };
  }
}

async function handlePostTweet(bearerToken, config) {
  try {
    // Twitter API v2 endpoint for posting tweets
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      { text: config.tweet },
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return {
      success: true,
      tweet: response.data
    };
  } catch (error) {
    console.error('Error posting tweet:', error);
    return {
      error: error.message
    };
  }
}

async function handleReplyTweet(bearerToken, config) {
  try {
    // Twitter API v2 endpoint for posting replies
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      {
        text: config.reply,
        reply: {
          in_reply_to_tweet_id: config.originalTweet.id
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        }
      }
    );

    return {
      success: true,
      reply: response.data
    };
  } catch (error) {
    console.error('Error posting reply:', error);
    return {
      error: error.message
    };
  }
}

module.exports = twitterAgentHandler; 