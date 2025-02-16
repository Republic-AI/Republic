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
        
        // Combine existing accounts with new account if it exists
        const accountsToFetch = newAccount ? 
          [...new Set([...targetAccounts, newAccount])] : 
          targetAccounts;
        
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
                console.log("Fetching tweets for account:", account, "URL:", `https://twttrapi.p.rapidapi.com/user-tweets?username=${account}`);
                const response = await axios.get(
                    `https://twttrapi.p.rapidapi.com/user-tweets?username=${account}`,
                    {
                        headers: {
                            'x-rapidapi-host': 'twttrapi.p.rapidapi.com',
                            'x-rapidapi-key': rapidApiKey,
                        },
                    }
                );
                console.log("RapidAPI Response Data Structure:", {
                    type: typeof response.data,
                    isArray: Array.isArray(response.data),
                    keys: Object.keys(response.data),
                    sample: JSON.stringify(response.data).slice(0, 200)
                });

                // Handle different possible response structures
                let tweets = [];
                if (Array.isArray(response.data)) {
                    tweets = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    tweets = response.data.data;
                } else if (response.data && typeof response.data === 'object') {
                    tweets = [response.data]; // Single tweet object
                } else {
                    console.error("Unexpected response structure:", response.data);
                    return [];
                }

                // Filter out any invalid tweets and map to our format
                return tweets
                    .filter(tweet => tweet && (tweet.text || tweet.full_text)) // Ensure tweet has text
                    .map(tweet => {
                        const tweetText = tweet.text || tweet.full_text || '';
                        const author = tweet.user?.screen_name || tweet.username || 'unknown';
                        return {
                            id: tweet.id_str || tweet.id || String(Date.now()),
                            text: tweetText,
                            author,
                            retweetedProfile: tweet.retweeted_status ? {
                                username: tweet.retweeted_status.user?.screen_name || 'unknown',
                                profile_image_url: tweet.retweeted_status.user?.profile_image_url_https || null
                            } : null
                        };
                    });

            } catch (error) {
                console.error(`Error fetching tweets for @${account}:`, error);
                if (error.response) {
                    console.error("RapidAPI Response Error Data:", {
                        status: error.response.status,
                        statusText: error.response.statusText,
                        data: error.response.data
                    });
                    console.log("Full response:", JSON.stringify(error.response, null, 2));
                }
                return [];
            }
        });

        const allTweets = (await Promise.all(tweetsPromises)).flat();

        // Filter tweets to include only those with base58 strings
        const recentTweets = allTweets
            .filter(tweet => tweet && typeof tweet.text === 'string')
            .map(tweet => ({
                ...tweet,
                base58Strings: extractBase58Strings(tweet.text)
            }))
            // Remove the base58 filter to see all tweets

        // Format the content for display
        const formattedContent = recentTweets
            .map(tweet => {
                if (tweet.retweetedProfile) {
                    return [
                        `Retweeted by @${tweet.author}:`,
                        tweet.text,
                        'From Account:',
                        `@${tweet.retweetedProfile.username}`,
                        '---'
                    ].join('\n');
                } else {
                    return [
                        `📝 @${tweet.author} Tweeted:`,
                        'Base58 Encoded Strings:',
                        ...tweet.base58Strings.map(str => `- ${str}`),
                        '---'
                    ].join('\n');
                }
            })
            .filter(content => content !== null)
            .join('\n\n');

        // If no tweets were found, provide a meaningful message
        if (recentTweets.length === 0) {
            return {
                content: `No relevant tweets found for account(s): ${accountsToFetch.join(', ')}`,
                tweets: []
            };
        }

        return {
            content: formattedContent,
            tweets: recentTweets
        };
    } catch (error) {
        console.error('Error in Twitter Fetcher handler:', error);
        return {
            content: `Error fetching tweets: ${error.message}`,
            tweets: []
        };
    }
}

module.exports = twitterFetcherHandler; 