const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

require('dotenv').config();

const SOLANA_TRACKER_API_BASE_URL = 'https://data.solanatracker.io';
const SOLANA_TRACKER_API_KEY = '54ca8aa7-77e2-444e-9625-07a9f5f0d006'; // Your API Key

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

async function analystAgentHandler(node) {
  try {
    const { contractAddress, parameters } = node.data;

    if (!contractAddress) {
      return { error: "No contract address provided" };
    }

    // Fetch data from Solana Tracker
    const tokenInfo = await fetchTokenInfo(contractAddress);
    const tokenHolders = await fetchTokenHolders(contractAddress);

    if (!tokenInfo || !tokenInfo.pools || tokenInfo.pools.length === 0) {
      return { error: `Could not retrieve token info or pools for ${contractAddress}` };
    }

    // Extract relevant data from the Solana Tracker response
    const tokenData = tokenInfo.token;
    const poolData = tokenInfo.pools[0]; // Assuming we use the first pool for simplicity

    const name = tokenData.name;
    const symbol = tokenData.symbol;
    const totalSupply = poolData.tokenSupply;
    const price = poolData.price.usd;
    const marketCap = poolData.marketCap.usd;
    const liquidity = poolData.liquidity.usd;
    const numHolders = tokenHolders.length; // Using top holders as an approximation

    // Top 10 holders calculation (using the top holders data)
    let top10Percentage = 0;
    if (tokenHolders && Array.isArray(tokenHolders)) {
        top10Percentage = tokenHolders.slice(0, 10).reduce((sum, holder) => sum + (holder.percentage || 0), 0);
    }

    // Check if token meets criteria
    const meetsCriteria =
      marketCap >= (parameters.mktCap * 1000000) &&  // Convert millions to USD
      liquidity >= (parameters.liquidity * 1000000) && // Convert millions to USD
      numHolders >= parameters.holders &&
      top10Percentage <= parameters.top10;

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