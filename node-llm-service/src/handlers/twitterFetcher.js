const axios = require('axios');

// Function to check if a string is base58 encoded
function isBase58(str) {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{44}$/;
    return base58Regex.test(str);
}

// Function to extract base58 strings from text
function extractBase58Strings(text) {
    const words = text.split(/\s+/);
    return words.filter(word => isBase58(word));
}

async function twitterFetcherHandler(node) {
    try {
        // Get the target accounts from the node data
        const targetAccounts = node.data.targetAccounts || [];
        const bearerToken = node.data.bearerToken;
        
        if (!bearerToken) {
            return {
                content: "No Twitter API Bearer Token provided",
                tweets: []
            };
        }
        
        if (targetAccounts.length === 0) {
            return {
                content: "No target accounts specified",
                tweets: []
            };
        }

        // Fetch tweets for each account
        const tweets = await Promise.all(targetAccounts.map(async (account) => {
            try {
                // Get user ID first
                const userResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${account}`, {
                    headers: {
                        'Authorization': `Bearer ${bearerToken}`
                    }
                });
                
                const userId = userResponse.data.data.id;
                
                // Fetch tweets with expanded info
                const response = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
                    headers: {
                        'Authorization': `Bearer ${bearerToken}`
                    },
                    params: {
                        'max_results': 100,
                        'tweet.fields': 'created_at,text,referenced_tweets,author_id',
                        'user.fields': 'description,profile_image_url,public_metrics',
                        'expansions': 'referenced_tweets.id,referenced_tweets.id.author_id'
                    }
                });

                const tweets = response.data.data || [];
                const includes = response.data.includes || {};

                // Process each tweet
                return tweets.map(tweet => {
                    const isRetweet = tweet.referenced_tweets?.some(ref => ref.type === 'retweeted');
                    let retweetedProfile = null;

                    if (isRetweet) {
                        const retweetId = tweet.referenced_tweets.find(ref => ref.type === 'retweeted').id;
                        const retweetedTweet = includes.tweets?.find(t => t.id === retweetId);
                        const retweetedAuthorId = retweetedTweet?.author_id;
                        const retweetedUser = includes.users?.find(u => u.id === retweetedAuthorId);

                        if (retweetedUser) {
                            retweetedProfile = {
                                username: retweetedUser.username,
                                description: retweetedUser.description,
                                profileImage: retweetedUser.profile_image_url,
                                metrics: retweetedUser.public_metrics
                            };
                        }
                    }

                    return {
                        text: tweet.text,
                        createdAt: tweet.created_at,
                        isRetweet,
                        author: account,
                        retweetedProfile
                    };
                });
            } catch (error) {
                console.error(`Error fetching tweets for ${account}:`, error);
                return [];
            }
        }));

        // Flatten and filter tweets
        const recentTweets = tweets
            .flat()
            .filter(tweet => {
                if (!tweet.createdAt) return false;
                const tweetTime = new Date(tweet.createdAt).getTime();
                return (Date.now() - tweetTime) <= (24 * 60 * 60 * 1000);
            });

        // Extract base58 strings and format the content
        const formattedContent = recentTweets.map(tweet => {
            const base58Strings = extractBase58Strings(tweet.text);
            
            if (base58Strings.length === 0) {
                return null; // Skip tweets without base58 strings
            }
            
            if (tweet.isRetweet) {
                return [
                    `🔄 @${tweet.author} Retweeted:`,
                    'Base58 Encoded Strings:',
                    ...base58Strings.map(str => `- ${str}`),
                    '',
                    'From Account:',
                    `@${tweet.retweetedProfile.username}`,
                    '---'
                ].join('\n');
            } else {
                return [
                    `📝 @${tweet.author} Tweeted:`,
                    'Base58 Encoded Strings:',
                    ...base58Strings.map(str => `- ${str}`),
                    '---'
                ].join('\n');
            }
        })
        .filter(content => content !== null) // Remove null entries (tweets without base58 strings)
        .join('\n\n');

        return {
            content: formattedContent,
            tweets: recentTweets.map(tweet => ({
                ...tweet,
                base58Strings: extractBase58Strings(tweet.text)
            })).filter(tweet => tweet.base58Strings.length > 0)
        };
    } catch (error) {
        console.error('Error in Twitter Fetcher handler:', error);
        throw error;
    }
}

module.exports = twitterFetcherHandler; 