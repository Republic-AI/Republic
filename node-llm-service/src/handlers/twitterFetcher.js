const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI
let openai;

function initializeOpenAI(apiKey) {
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
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
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
    const isOpenAIInitialized = initializeOpenAI(node.data.openAIApiKey); // Pass OpenAI API Key

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
                        params: { username: account },
                        headers: {
                            'x-rapidapi-key': rapidApiKey,
                            'x-rapidapi-host': 'twttrapi.p.rapidapi.com'
                        }
                    }
                );

                // Extract instructions array from response
                const instructions = response.data?.data?.user_result?.result?.timeline_response?.timeline?.instructions || [];
                
                // Process timeline instructions to extract tweets
                const formattedTweets = [];
                
                instructions.forEach(instruction => {
                    // Handle both regular entries and pinned tweets
                    if (instruction.__typename === 'TimelineAddEntries') {
                        // Process multiple entries
                        instruction.entries?.forEach(entry => processEntry(entry, formattedTweets));
                    } else if (instruction.__typename === 'TimelinePinEntry') {
                        // Process single pinned entry
                        processEntry(instruction.entry, formattedTweets);
                    }
                });

                // Helper function to process a single entry
                function processEntry(entry, tweetArray) {
                    if (entry?.content?.__typename === 'TimelineTimelineItem') {
                        const tweetResult = entry.content?.content?.tweetResult?.result;
                        if (tweetResult) {
                            tweetArray.push({
                                text: tweetResult.legacy?.full_text,
                                created_at: tweetResult.legacy?.created_at,
                                metrics: {
                                    likes: tweetResult.legacy?.favorite_count,
                                    retweets: tweetResult.legacy?.retweet_count,
                                    replies: tweetResult.legacy?.reply_count,
                                    views: tweetResult.view_count_info?.count
                                },
                                id: tweetResult.legacy.id_str,
                                author: tweetResult.core?.user_result?.result?.legacy?.screen_name,
                                isPinned: entry.content.content.socialContext?.contextType === "Pin"
                            });
                        }
                    }
                }

                // Filter tweets by time
                const timeLength = parseInt(node.data.pullConfig.timeLength) || 24;
                const cutoffTime = new Date(Date.now() - (timeLength * 60 * 60 * 1000));
                
                const filteredTweets = formattedTweets.filter(tweet => {
                    if (!tweet.created_at) return false;
                    const tweetDate = new Date(tweet.created_at);
                    return tweetDate >= cutoffTime;
                });

                return {
                    account,
                    rawData: filteredTweets,
                    timestamp: new Date().toISOString(),
                    result: response.data?.data?.user_result
                };

            } catch (error) {
                console.error(`Error fetching tweets for ${account}:`, {
                    message: error.message,
                    code: error.code,
                    response: error.response?.data
                });
                return {
                    account,
                    rawData: [],
                    timestamp: new Date().toISOString(),
                    error: `Failed to fetch tweets for ${account}`
                };
            }
        });

        const results = await Promise.all(tweetsPromises);
        
        // Combine all filtered tweets for AI analysis
        const allFilteredTweets = results.flatMap(result => result.rawData);
        
        // Only perform AI analysis if there are filtered tweets
        let aiAnalysis = null;
        if (allFilteredTweets.length > 0 && isOpenAIInitialized) {
            try {
                if (node.data.isOriginalCA) {
                    // Prompt specifically for finding Base58 addresses
                    const prompt = `Analyze these tweets and extract ONLY valid Base58-encoded strings that look like Solana addresses or contract addresses.  Base58 strings are typically 32-44 characters long and contain only alphanumeric characters. Format the output as a simple list of addresses, one per line. Ignore any other content:

                    ${allFilteredTweets.map(tweet => tweet.text).join('\n\n')}`;

                    const completion = await openai.createChatCompletion({
                        model: "gpt-3.5-turbo",
                        messages: [{
                            role: "user",
                            content: prompt
                        }],
                        temperature: 0.1, // Lower temperature for more deterministic output
                        max_tokens: 500
                    });

                    // Extract and filter Base58 strings.  This is the key change.
                    aiAnalysis = completion.data.choices[0].message.content
                        .split('\n')
                        .map(line => line.trim()) // Trim whitespace
                        .filter(line => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(line)) // Base58 regex
                        .join('\n'); // Join back into a single string, one address per line

                } else {
                    // Use custom prompt from pullConfig, or fallback to a default
                    const userPrompt = node.data.pullConfig.aiPrompt || 'Analyze these tweets:';
                    const prompt = `${userPrompt}\n\n${allFilteredTweets.map(tweet =>
                        `Tweet by ${tweet.author} (${tweet.created_at}):
                         "${tweet.text}"
                         Engagement: ${tweet.metrics.likes} likes, ${tweet.metrics.retweets} RTs, ${tweet.metrics.replies} replies${tweet.metrics.views ? `, ${tweet.metrics.views} views` : ''}`
                    ).join('\n\n')}`;

                    const completion = await openai.createChatCompletion({
                        model: "gpt-3.5-turbo",
                        messages: [{
                            role: "user",
                            content: prompt
                        }],
                        temperature: 0.7,
                        max_tokens: 500
                    });

                    aiAnalysis = completion.data.choices[0].message.content;
                }
            } catch (error) {
                console.error('Error in AI analysis:', error);
                aiAnalysis = `Error in AI analysis: ${error.message}`;
            }
        }

        // Format the final content for display
        const summary = results.map(result => {
            const tweetCount = result.rawData.length;
            return `@${result.account}: ${tweetCount} tweets in the last ${node.data.pullConfig.timeLength} hours`;
        }).join('\n');

        const finalContent = results.map(result => {
            return `Account: @${result.account}\n` +
                result.rawData.map(tweet => 
                    `[${new Date(tweet.created_at).toLocaleString()}] ${tweet.isPinned ? '[PINNED] ' : ''}${tweet.text}\n` +
                    `Engagement: ${tweet.metrics.likes} likes, ${tweet.metrics.retweets} RTs, ${tweet.metrics.replies} replies` +
                    (tweet.metrics.views ? `, ${tweet.metrics.views} views` : '')
                ).join('\n\n');
        }).join('\n\n---\n\n');

        // If Check CA is enabled, extract CA from raw tweets
        if (node.data.pullConfig.isOriginalCA) {
            let foundCA = null;
            
            // Go through each tweet's text to find CA
            for (const tweet of allFilteredTweets) {
                const base58Addresses = extractBase58Strings(tweet.text);
                if (base58Addresses.length > 0) {
                    foundCA = base58Addresses[0]; // Take the first found CA
                    break;
                }
            }

            // Return only the CA or "notfound"
            return {
                content: foundCA || "notfound",
                summary: foundCA ? "Found CA" : "No CA found",
                rawResults: allFilteredTweets
            };
        }

        // Modify the return format based on CA mode
        if (node.data.isOriginalCA) {
            return {
                content: aiAnalysis || 'No Base58 addresses found',
                summary: 'Base58 Address Extraction Mode',
                rawResults: allFilteredTweets,
                aiAnalysis
            };
        }

        return {
            content: finalContent,
            summary,
            rawResults: allFilteredTweets, // Only return filtered tweets
            aiAnalysis
        };

    } catch (error) {
        console.error('Error in Twitter Fetcher handler:', error);
        const errorMessage = error.response?.data?.message || error.message;
        return {
            content: `Error: ${errorMessage}`,
            summary: 'Error occurred',
            rawResults: []
        };
    }
}

module.exports = twitterFetcherHandler; 