const axios = require('axios');

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
        // Note: You'll need to replace this with actual Twitter API calls
        // using your Twitter API credentials
        const tweets = await Promise.all(targetAccounts.map(async (account) => {
            try {
                // This is a placeholder for the actual Twitter API call
                const response = await axios.get(`https://api.twitter.com/2/users/${account}/tweets`, {
                    headers: {
                        'Authorization': `Bearer ${bearerToken}`
                    },
                    params: {
                        'max_results': 100,
                        'tweet.fields': 'created_at,text'
                    }
                });

                return response.data.data || [];
            } catch (error) {
                console.error(`Error fetching tweets for ${account}:`, error);
                return [];
            }
        }));

        // Flatten the array of tweets and filter for last 24 hours
        const recentTweets = tweets
            .flat()
            .filter(tweet => {
                if (!tweet.created_at) return false;
                const tweetTime = new Date(tweet.created_at).getTime();
                return (Date.now() - tweetTime) <= (24 * 60 * 60 * 1000);
            })
            .map(tweet => tweet.text);

        return {
            content: recentTweets.join('\n\n'),
            tweets: recentTweets
        };
    } catch (error) {
        console.error('Error in Twitter Fetcher handler:', error);
        throw error;
    }
}

module.exports = twitterFetcherHandler; 