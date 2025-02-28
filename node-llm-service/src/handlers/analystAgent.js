const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const SOLANA_TRACKER_API_BASE_URL = 'https://data.solanatracker.io';
const SOLANA_TRACKER_API_KEY = '54ca8aa7-77e2-444e-9625-07a9f5f0d006'; // Your API Key

// Initialize OpenAI API
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function fetchTokenInfo(tokenAddress) {
  try {
    const response = await axios.get(`${SOLANA_TRACKER_API_BASE_URL}/tokens/${tokenAddress}`, {
      headers: {
        'x-api-key': SOLANA_TRACKER_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching token info from Solana Tracker:', error);
    if (error.response) {
      console.error("Solana Tracker API Response:", error.response.data);
    }
    throw new Error(`Failed to fetch token info for ${tokenAddress} from Solana Tracker: ${error.message}`);
  }
}

async function fetchTokenHolders(tokenAddress) {
    try {
        const response = await axios.get(`${SOLANA_TRACKER_API_BASE_URL}/tokens/${tokenAddress}/holders/top`, {
            headers: {
                'x-api-key': SOLANA_TRACKER_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching token holders from Solana Tracker:', error);
        if (error.response) {
            console.error("Solana Tracker API Response:", error.response.data);
        }
        throw new Error(`Failed to fetch token holders for ${tokenAddress} from Solana Tracker: ${error.message}`);
    }
}

async function fetchRiskData(tokenAddress) {
  // ... (same as before) ...
}

async function analyzePromptWithAI(prompt, contractAddress) {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an AI that analyzes user prompts to extract parameters for a token analysis.
                    The user will provide a prompt describing desired token characteristics.
                    Your task is to extract the following parameters and return them in JSON format:
                    
                    - mktCap (array of two numbers): Market cap range in millions [min, max].
                    - liquidity (array of two numbers): Liquidity range in millions [min, max].
                    - top10 (array of two numbers): Top 10 holders percentage range [min, max].
                    - snipers (array of two numbers): Sniper score range [min, max].
                    - blueChip (array of two numbers): Blue chip holder percentage range [min, max].
                    - hasAudit (boolean): Whether the token has an audit.

                    If a parameter is not specified in the prompt, do NOT include it in the JSON output.
                    Only include parameters that can be confidently extracted from the prompt.
                    
                    Example prompt: "Find tokens with a market cap between $1M and $10M, high liquidity, and low sniper risk."
                    
                    Expected JSON output:
                    {
                      "mktCap": [1, 10],
                      "liquidity": [50, 100], // Assuming "high liquidity" maps to 50-100
                      "snipers": [0, 20]     // Assuming "low sniper risk" maps to 0-20
                    }
                    
                    Do NOT include any additional text or explanation.  Output ONLY the JSON.
                    `
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.2, // Lower temperature for more deterministic output
            max_tokens: 200,  // Limit output length
        });

        const extractedParameters = JSON.parse(response.data.choices[0].message.content);
        return extractedParameters;

    } catch (error) {
        console.error('Error in AI prompt analysis:', error);
        return {}; // Return empty object on error
    }
}

async function analystAgentHandler(node) {
  try {
    const { contractAddress, parameters } = node.data;

    if (!contractAddress) {
      return { error: "No contract address provided" };
    }

    // Ensure parameters has default values if undefined
    const safeParameters = {
      mktCap: parameters?.mktCap || [0, 1000],
      liquidity: parameters?.liquidity || [0, 100],
      top10: parameters?.top10 || [0, 100],
      snipers: parameters?.snipers || [0, 70],
      blueChip: parameters?.blueChip || [0, 100],
      hasAudit: parameters?.hasAudit || false
    };

    // Fetch data from Solana Tracker
    const tokenInfo = await fetchTokenInfo(contractAddress);
    const tokenHolders = await fetchTokenHolders(contractAddress);

    if (!tokenInfo || !tokenInfo.pools || tokenInfo.pools.length === 0) {
      return { error: `Could not retrieve token info or pools for ${contractAddress}` };
    }

    // Extract relevant data from the Solana Tracker response
    const tokenData = tokenInfo.token;
    const poolData = tokenInfo.pools[0]; // Assuming we use the first pool for simplicity
    const riskData = tokenInfo.risk;

    const name = tokenData.name;
    const symbol = tokenData.symbol;
    const totalSupply = poolData.tokenSupply;
    const price = poolData.price.usd;
    const marketCap = poolData.marketCap.usd;
    const liquidity = poolData.liquidity.usd;
    const numHolders = tokenHolders.length; // Using top holders as an approximation.  Consider fetching *all* holders if needed.
    const riskScore = riskData.score;
    const rugged = riskData.rugged;
    const riskDetails = riskData.risks;

    // Top 10 holders calculation (using the top holders data)
    let top10Percentage = 0;
    if (tokenHolders && Array.isArray(tokenHolders)) {
        top10Percentage = tokenHolders.slice(0, 10).reduce((sum, holder) => sum + (holder.percentage || 0), 0);
    }

    // Check if token meets criteria
    const meetsCriteria =
      marketCap >= (safeParameters.mktCap[0] * 1000000) &&  // Convert millions to USD
      marketCap <= (safeParameters.mktCap[1] * 1000000) &&
      liquidity >= (safeParameters.liquidity[0] * 1000000) && // Convert millions to USD
      liquidity <= (safeParameters.liquidity[1] * 1000000) &&
      top10Percentage >= safeParameters.top10[0] &&
      top10Percentage <= safeParameters.top10[1];

    const analysisData = {
      contractAddress: contractAddress,
      name: name,
      symbol: symbol,
      price,
      marketCap,
      liquidity,
      holders: numHolders,
      top10Percentage,
      meetsCriteria,
      totalSupply,
      risk: {
        score: riskScore,
        rugged: rugged,
        details: riskDetails
      },
      holderMetrics: {
        top10Holders: tokenHolders.slice(0,10)
      }
    };

    return { analysisData };

  } catch (error) {
    console.error('Error in analyst agent handler:', error);
    return { error: error.message };
  }
}

module.exports = analystAgentHandler; 