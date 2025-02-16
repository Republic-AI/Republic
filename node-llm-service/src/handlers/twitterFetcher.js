const axios = require('axios');

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

async function twitterFetcherHandler(node) {
    console.log("twitterFetcherHandler called. Node data:", node);
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

                // Log detailed response information
                console.log(`Response status for ${account}:`, response.status);
                console.log(`Response headers for ${account}:`, response.headers);
                console.log(`Raw API Response for ${account}:`, JSON.stringify(response.data, null, 2));

                // Filter tweets by time range if specified
                const timeLength = parseInt(node.data.pullConfig.timeLength) || 24;
                const cutoffTime = new Date(Date.now() - (timeLength * 60 * 60 * 1000));
                
                // Process the tweets array from the response
                const tweets = response.data?.tweets || response.data || [];
                
                // Filter tweets by time if they have a created_at field
                const filteredTweets = Array.isArray(tweets) ? tweets.filter(tweet => {
                    if (!tweet.created_at) return true; // Include tweets without timestamp
                    const tweetDate = new Date(tweet.created_at);
                    return tweetDate >= cutoffTime;
                }) : tweets;

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
                return [
                    `Raw Twitter API Response for @${result.account}:`,
                    '```',
                    JSON.stringify(result.rawData, null, 2),
                    '```',
                    `Fetched at: ${result.timestamp}`,
                    '---'
                ].join('\n');
            })
            .join('\n\n');

        // Add summary information
        const summary = `Fetched data for ${results.length} accounts. ` +
            `Success: ${results.filter(r => !r.error).length}, ` +
            `Failed: ${results.filter(r => r.error).length}`;

        return {
            content: formattedContent,
            summary,
            rawResults: results
        };

    } catch (error) {
        console.error('Error in Twitter Fetcher handler:', error);
        const errorMessage = error.response?.data?.message || error.message;
        return {
            content: `Error fetching tweets: ${errorMessage}\n\nFull error: ${JSON.stringify(error.response?.data || {}, null, 2)}`,
            rawResults: []
        };
    }
}

module.exports = twitterFetcherHandler; 