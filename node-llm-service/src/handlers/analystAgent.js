const { Connection, PublicKey } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');
const axios = require('axios');

require('dotenv').config();

async function analystAgentHandler(node) {
  try {
    const { contractAddress, parameters } = node.data;

    if (!contractAddress) {
      return { error: "No contract address provided" };
    }

    // Connect to Solana using QuickNode
    const connection = new Connection(
      process.env.SOLANA_RPC_URL,
      "confirmed"
    );

    // Initialize Metaplex
    const metaplex = new Metaplex(connection);

    // Get the Token's Mint Address
    let mint;
    try {
      mint = new PublicKey(contractAddress);
    } catch (error) {
      return { error: `Invalid contract address: ${contractAddress}` };
    }

    // Fetch token data in parallel
    const [
      tokenSupply,
      largestAccounts,
      priceData,
      birdseyeData
    ] = await Promise.all([
      // Get total supply
      connection.getTokenSupply(mint),
      
      // Get largest token holders
      connection.getTokenLargestAccounts(mint),

      // Get price data from Jupiter
      fetchPriceData(mint.toBase58()),

      // Get additional data from Birdseye API
      fetchBirdseyeData(mint.toBase58())
    ]);

    // Try to get metadata separately as it might fail
    let metadata = null;
    try {
      metadata = await metaplex.nfts().findByMint({ mintAddress: mint });
    } catch (error) {
      console.warn('Failed to fetch metadata:', error);
      metadata = {
        name: 'Unknown',
        symbol: 'UNKNOWN',
        description: '',
        uri: ''
      };
    }

    // Calculate metrics
    const totalSupply = tokenSupply.value.uiAmount;
    const numHolders = birdseyeData.holders || 0;
    const top10Holders = largestAccounts.value.slice(0, 10);
    const top10Supply = top10Holders.reduce((sum, holder) => sum + holder.uiAmount, 0);
    const top10Percentage = (top10Supply / totalSupply) * 100;

    // Calculate market cap and liquidity using Jupiter price data
    const price = priceData.price || 0;
    const marketCap = totalSupply * price;
    const liquidityValue = priceData.liquidity || 0;

    // Check if token meets criteria
    const meetsCriteria = 
      marketCap >= parameters.mktCap &&
      liquidityValue >= parameters.liquidity &&
      numHolders >= parameters.holders &&
      top10Percentage <= parameters.top10;

    const analysisData = {
      contractAddress: contractAddress,
      name: metadata.name,
      symbol: metadata.symbol,
      price,
      marketCap,
      liquidity: liquidityValue,
      holders: numHolders,
      top10Percentage,
      meetsCriteria,
      totalSupply,
      metadata: {
        uri: metadata.uri,
        description: metadata.description,
      },
      priceMetrics: {
        price24hChange: priceData.price24hChange,
        volume24h: priceData.volume24h,
      }
    };

    return { analysisData };

  } catch (error) {
    console.error('Error in analyst agent handler:', error);
    return { error: error.message };
  }
}

// Helper function to fetch price and liquidity data from Jupiter
async function fetchPriceData(mintAddress) {
  try {
    const response = await axios.get(`${process.env.JUPITER_API_URL}?id=${mintAddress}&vsToken=USDC`);
    
    if (response.data.error) {
      console.error('Jupiter API error:', response.data.error);
      return {
        price: 0,
        liquidity: 0,
        price24hChange: 0,
        volume24h: 0
      };
    }

    const data = response.data.data;
    return {
      price: data.price || 0,
      liquidity: data.liquidity || 0,
      price24hChange: data.price24hChange || 0,
      volume24h: data.volume24h || 0
    };
  } catch (error) {
    console.error('Error fetching price data:', error);
    return {
      price: 0,
      liquidity: 0,
      price24hChange: 0,
      volume24h: 0
    };
  }
}

// Helper function to fetch additional data from Birdseye API
async function fetchBirdseyeData(mintAddress) {
  try {
    const response = await axios.get(`https://public-api.birdeye.so/public/token_list?address=${mintAddress}`, {
      headers: {
        'X-API-KEY': '3f5d5c90d6c54a8d9a90a129c84b69b5'  // This is a public API key
      }
    });
    
    if (response.data.error) {
      console.error('Birdseye API error:', response.data.error);
      return {
        holders: 0
      };
    }

    const tokenData = response.data.data?.[0] || {};
    return {
      holders: tokenData.holder || 0
    };
  } catch (error) {
    console.error('Error fetching Birdseye data:', error);
    return {
      holders: 0
    };
  }
}

module.exports = analystAgentHandler; 