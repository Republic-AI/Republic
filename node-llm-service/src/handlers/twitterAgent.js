const axios = require('axios');
const twitterFetcherHandler = require('./twitterFetcher');

async function twitterAgentHandler(node) {
  const { bearerToken, pullConfig, postConfig, replyConfig } = node.data;
  const rapidApiKey = "17ce04b49amsh78d1d9d3603c65ep12fc75jsn4c9521e3459f"
  
  console.log("twitterAgentHandler called. Node data:", node);

  if (!rapidApiKey) {
    return {
      error: "No Twitter API Bearer Token provided"
    };
  }

  // Handle different subagent operations based on the active one
  switch (node.data.activeSubAgent) {
    case 'post':
      return { output: await handlePostTweet(rapidApiKey, postConfig) };
    case 'reply':
      return { output: await handleReplyTweet(rapidApiKey, replyConfig) };
    case 'pull':
      const pullResult = await twitterFetcherHandler(node);
      return { ...pullResult };
    default:
      return { error: "Invalid subagent type" };
  }
}

async function handlePostTweet(rapidApiKey, config) {
  try {
    // Replace with the actual RapidAPI endpoint for posting tweets
    const response = await axios.post(
      'https://rapidapi.example.com/post-tweet',
      {
        text: config.tweet,
        // Add any other required parameters for the RapidAPI endpoint
      },
      {
        headers: {
          'x-rapidapi-host': 'rapidapi.example.com', // Replace with the correct host
          'x-rapidapi-key': rapidApiKey,
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

async function handleReplyTweet(rapidApiKey, config) {
  try {
    // Replace with the actual RapidAPI endpoint for replying to tweets
    const response = await axios.post(
      'https://rapidapi.example.com/reply-to-tweet',
      {
        text: config.reply,
        in_reply_to_tweet_id: config.originalTweet.id, // Add the tweet ID to reply to
        // Add any other required parameters for the RapidAPI endpoint
      },
      {
        headers: {
          'x-rapidapi-host': 'rapidapi.example.com',  // Replace with the correct host
          'x-rapidapi-key': rapidApiKey,
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