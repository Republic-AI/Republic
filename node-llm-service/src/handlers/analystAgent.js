const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

require('dotenv').config();

async function fetchPriceData(mintAddress) {
  try {
    console.log('Fetching price data for:', mintAddress);
    const response = await axios.get(`https://api.jup.ag/price/v2`, {
      params: {
        ids: mintAddress,
        showExtraInfo: true  // To get more detailed price info
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Jupiter API Response:', JSON.stringify(response.data, null, 2));

    if (!response.data?.data?.[mintAddress]) {
      console.warn('No price data available for token:', mintAddress);
      return {
        price: 0,
        liquidity: 0,
        price24hChange: 0,
        volume24h: 0,
        confidenceLevel: 'low'
      };
    }

    const tokenData = response.data.data[mintAddress];
    const extraInfo = tokenData.extraInfo || {};
    const quotedPrice = extraInfo.quotedPrice || {};
    const depth = extraInfo.depth || {};

    return {
      price: tokenData.price || 0,
      liquidity: depth.buyPriceImpactRatio?.depth?.[1000] || 0, // Using depth as liquidity indicator
      price24hChange: ((quotedPrice.buyPrice - quotedPrice.sellPrice) / quotedPrice.sellPrice) * 100 || 0,
      volume24h: 0, // Volume not directly provided in v2 API
      confidenceLevel: extraInfo.confidenceLevel || 'low'
    };
  } catch (error) {
    console.error('Error fetching price data:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    return {
      price: 0,
      liquidity: 0,
      price24hChange: 0,
      volume24h: 0,
      confidenceLevel: 'low'
    };
  }
}

async function analystAgentHandler(node) {
  try {
    const { contractAddress, parameters } = node.data;

    if (!contractAddress) {
      return { error: "No contract address provided" };
    }

    // Connect to Solana using QuickNode
    const connection = new Connection(
      process.env.SOLANA_RPC_URL,
      {
        commitment: "confirmed",
        httpHeaders: {
          "Content-Type": "application/json",
        }
      }
    );

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
      tokenAccounts,
      metadata,
      priceData
    ] = await Promise.all([
      // Get total supply
      connection.getTokenSupply(mint),
      
      // Get all token accounts
      connection.getParsedProgramAccounts(mint, {
        filters: [
          {
            dataSize: 165, // Size of token account
          },
        ],
      }),

      // Get token metadata
      connection.getAccountInfo(mint),

      // Get price data from Jupiter
      fetchPriceData(contractAddress)
    ]);

    // Calculate holder metrics
    const numHolders = tokenAccounts.length;
    const sortedHolders = tokenAccounts
      .map(account => ({
        address: account.pubkey.toString(),
        balance: account.account.data.parsed.info.tokenAmount.uiAmount
      }))
      .sort((a, b) => b.balance - a.balance);

    const top10Holders = sortedHolders.slice(0, 10);
    const totalSupply = tokenSupply.value.uiAmount;
    const top10Supply = top10Holders.reduce((sum, holder) => sum + holder.balance, 0);
    const top10Percentage = (top10Supply / totalSupply) * 100;

    // Calculate market metrics
    const price = priceData.price;
    const marketCap = totalSupply * price;
    const liquidityValue = priceData.liquidity;

    // Check if token meets criteria
    const meetsCriteria = 
      marketCap >= parameters.mktCap &&
      liquidityValue >= parameters.liquidity &&
      numHolders >= parameters.holders &&
      top10Percentage <= parameters.top10;

    const analysisData = {
      contractAddress: contractAddress,
      name: metadata?.data?.name || 'Unknown',
      symbol: metadata?.data?.symbol || 'UNKNOWN',
      price,
      marketCap,
      liquidity: liquidityValue,
      holders: numHolders,
      top10Percentage,
      meetsCriteria,
      totalSupply,
      priceMetrics: {
        price24hChange: priceData.price24hChange,
        volume24h: priceData.volume24h,
      },
      holderMetrics: {
        top10Holders: top10Holders.map(holder => ({
          address: holder.address,
          percentage: (holder.balance / totalSupply) * 100
        }))
      }
    };

    return { analysisData };

  } catch (error) {
    console.error('Error in analyst agent handler:', error);
    return { error: error.message };
  }
}

module.exports = analystAgentHandler; 