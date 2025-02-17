const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI
let openai;

function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OpenAI API key is not set. AI analysis will be disabled.");
    return false;
  }
  const configuration = new Configuration({
      apiKey: apiKey,
  });
  openai = new OpenAIApi(configuration);
  return true;
}

// Function to check if a string is base58 encoded
function isBase58(str) {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{44}$/;
    return base58Regex.test(str);
}

// Function to extract base58 strings from text
function extractBase58Strings(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }
    const words = text.split(/\s+/);
    return words.filter(word => isBase58(word));
}

async function analyzeWithAI(tweets, prompt) {
    if (!openai) {
        return "AI analysis is disabled because the OpenAI API key is not set.";
    }
    try {
        const analysis = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an AI analyst specializing in social media content analysis."
                },
                {
                    role: "user",
                    content: `${prompt}\n\nTweets to analyze:\n${JSON.stringify(tweets, null, 2)}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        });

        return analysis.data.choices[0].message.content;
    } catch (error) {
        console.error('Error in AI analysis:', error);
        let errorMessage = 'Error in AI analysis: ';
        if (error.response) {
            errorMessage += `${error.response.status} - ${JSON.stringify(error.response.data)}`;
        } else {
            errorMessage += error.message;
        }
        return errorMessage;
    }
}

async function twitterFetcherHandler(node) {
    console.log("twitterFetcherHandler called. Node data:", node);
    const isOpenAIInitialized = initializeOpenAI();

    try {
        // Get the target accounts from the node data
        const targetAccounts = node.data.pullConfig.targetAccounts || [];
        const newAccount = node.data.pullConfig.newAccount;
        
        console.log("Target accounts:", targetAccounts, "New account:", newAccount);
        
        // Combine existing accounts with new account if it exists
        const accountsToFetch = newAccount ? 
          [...new Set([...targetAccounts, newAccount])] : 
          targetAccounts;
        
        console.log("Accounts to fetch:", accountsToFetch);
        
        const rapidApiKey = "17ce04b49amsh78d1d9d3603c65ep12fc75jsn4c9521e3459f";
        
        if (!rapidApiKey) {
            return {
                content: "No RapidAPI Key provided",
                tweets: []
            };
        }
        
        if (accountsToFetch.length === 0) {
            return {
                content: "No target accounts specified",
                tweets: []
            };
        }

        const tweetsPromises = accountsToFetch.map(async (account) => {
            try {
                console.log("Fetching tweets for account:", account);
                const response = await axios.get(
                    `https://twttrapi.p.rapidapi.com/user-tweets`,
                    {
                        params: {
                            username: account
                        },
                        headers: {
                            'x-rapidapi-key': rapidApiKey,
                            'x-rapidapi-host': 'twttrapi.p.rapidapi.com'
                        }
                    }
                );

                // Extract tweets from the response
                const tweets = response.data?.data?.tweets || [];
                
                // Format tweets for better readability and AI analysis
                const formattedTweets = tweets.map(tweet => ({
                    text: tweet.text,
                    created_at: tweet.created_at,
                    id: tweet.id,
                    metrics: {
                        retweets: tweet.public_metrics?.retweet_count || 0,
                        likes: tweet.public_metrics?.like_count || 0,
                        replies: tweet.public_metrics?.reply_count || 0
                    }
                }));

                // Filter tweets by time if they have a created_at field
                const timeLength = parseInt(node.data.pullConfig.timeLength) || 24;
                const cutoffTime = new Date(Date.now() - (timeLength * 60 * 60 * 1000));
                
                const filteredTweets = formattedTweets.filter(tweet => {
                    if (!tweet.created_at) return true; // Include tweets without timestamp
                    const tweetDate = new Date(tweet.created_at);
                    return tweetDate >= cutoffTime;
                });

                return {
                    account,
                    rawData: filteredTweets,
                    timestamp: new Date().toISOString()
                };

            } catch (error) {
                console.error(`Error fetching tweets for @${account}:`, error);
                if (error.response) {
                    console.error(`Full error response for ${account}:`, {
                        status: error.response.status,
                        statusText: error.response.statusText,
                        headers: error.response.headers,
                        data: error.response.data,
                        config: {
                            url: error.response.config.url,
                            method: error.response.config.method,
                            headers: error.response.config.headers,
                            params: error.response.config.params
                        }
                    });
                }
                return {
                    account,
                    error: error.message,
                    errorDetails: error.response?.data || {},
                    timestamp: new Date().toISOString()
                };
            }
        });

        const results = await Promise.all(tweetsPromises);

        // Perform AI analysis if prompt is provided
        let aiAnalysis = null;
        if (isOpenAIInitialized && node.data.pullConfig.aiPrompt && results.some(r => !r.error)) {
            const validTweets = results
                .filter(r => !r.error)
                .map(r => r.rawData)
                .flat();
            
            // Prepare tweets for AI analysis
            const tweetsForAnalysis = validTweets.map(tweet => ({
                text: tweet.text,
                metrics: tweet.metrics,
                timestamp: tweet.created_at
            }));
            
            aiAnalysis = await analyzeWithAI(tweetsForAnalysis, node.data.pullConfig.aiPrompt);
        }

        // Format the content to display raw results
        const formattedContent = results
            .map(result => {
                if (result.error) {
                    return [
                        `Error fetching tweets for @${result.account}:`,
                        `Message: ${result.error}`,
                        'Error Details:',
                        '```',
                        JSON.stringify(result.errorDetails, null, 2),
                        '```',
                        `Timestamp: ${result.timestamp}`,
                        '---'
                    ].join('\n');
                }
                // Format tweets for display
                const tweetDisplay = result.rawData.map(tweet => 
                    `Tweet: ${tweet.text}\n` +
                    `Time: ${new Date(tweet.created_at).toLocaleString()}\n` +
                    `Metrics: ${tweet.metrics.retweets} RTs, ${tweet.metrics.likes} Likes, ${tweet.metrics.replies} Replies\n`
                ).join('\n');

                return [
                    `Raw Twitter API Response for @${result.account}:`,
                    '```',
                    tweetDisplay,
                    '```',
                    `Fetched at: ${result.timestamp}`,
                    '---'
                ].join('\n');
            })
            .join('\n\n');

        // Add AI analysis to the content if available
        const finalContent = aiAnalysis 
            ? `${formattedContent}\n\nAI Analysis:\n${aiAnalysis}`
            : formattedContent;

        // Add summary information
        const summary = `Fetched data for ${results.length} accounts. ` +
            `Success: ${results.filter(r => !r.error).length}, ` +
            `Failed: ${results.filter(r => r.error).length}`;

        return {
            content: finalContent,
            summary,
            rawResults: results,
            aiAnalysis
        };

    } catch (error) {
        console.error('Error in Twitter Fetcher handler:', error);
        const errorMessage = error.response?.data?.message || error.message;
        return {
            content: `Error fetching tweets: ${errorMessage}\n\nFull error: ${JSON.stringify(error.response?.data || {}, null, 2)}`,
            rawResults: [],
            aiAnalysis: null
        };
    }
}

module.exports = twitterFetcherHandler; 