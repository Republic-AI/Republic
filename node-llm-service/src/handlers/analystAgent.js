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
    const response = await axios.get(`${SOLANA_TRACKER_API_BASE_URL}/api/v1/token/${tokenAddress}`, {
      headers: {
        'X-API-KEY': SOLANA_TRACKER_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching token info:', error.message);
    return null;
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
  try {
    const response = await axios.get(`${SOLANA_TRACKER_API_BASE_URL}/api/v1/risk/token/${tokenAddress}`, {
      headers: {
        'X-API-KEY': SOLANA_TRACKER_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching risk data:', error.message);
    return null;
  }
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
    console.log("Analyzing token:", node.data.contractAddress);
    
    // Check if contractAddress is provided
    if (!node.data.contractAddress) {
      return {
        error: "No contract address provided",
        analysisData: {
          meetsCriteria: false,
          name: "Unknown",
          symbol: "Unknown",
          contractAddress: "",
          risk: {
            score: 0,
            rugged: false,
            details: []
          }
        }
      };
    }
    
    // Fetch token information
    const tokenInfo = await fetchTokenInfo(node.data.contractAddress);
    
    // Handle case where token info couldn't be fetched
    if (!tokenInfo) {
      return {
        error: "Failed to fetch token information",
        analysisData: {
          meetsCriteria: false,
          name: "Unknown",
          symbol: "Unknown",
          contractAddress: node.data.contractAddress,
          risk: {
            score: 0,
            rugged: false,
            details: []
          }
        }
      };
    }
    
    // Fetch risk information
    const riskData = await fetchRiskData(node.data.contractAddress);
    
    // Extract parameters from node data
    const parameters = node.data.parameters || {};
    
    // Default parameters if not specified
    const mktCapRange = parameters.mktCap || [0, 1000]; // $0M to $1000M
    const liquidityRange = parameters.liquidity || [0, 100]; // $0M to $100M
    const top10Range = parameters.top10 || [0, 100]; // 0% to 100%
    const snipersRange = parameters.snipers || [0, 100]; // 0 to 100 score
    const blueChipRange = parameters.blueChip || [0, 100]; // 0% to 100%
    const requiresAudit = parameters.hasAudit || false;
    
    // Extract relevant metrics from token data
    const marketCap = tokenInfo.market_cap ? tokenInfo.market_cap / 1000000 : 0; // Convert to millions
    const liquidity = tokenInfo.liquidity ? tokenInfo.liquidity / 1000000 : 0; // Convert to millions
    const top10Percentage = tokenInfo.top_10_holders_percentage || 0;
    const sniperScore = tokenInfo.sniper_score || 0;
    const blueChipPercentage = tokenInfo.blue_chip_holders_percentage || 0;
    const hasAudit = tokenInfo.has_audit || false;
    
    // Determine if token meets criteria
    const meetsMktCap = marketCap >= mktCapRange[0] && marketCap <= mktCapRange[1];
    const meetsLiquidity = liquidity >= liquidityRange[0] && liquidity <= liquidityRange[1];
    const meetsTop10 = top10Percentage >= top10Range[0] && top10Percentage <= top10Range[1];
    const meetsSniper = sniperScore >= snipersRange[0] && sniperScore <= snipersRange[1];
    const meetsBlueChip = blueChipPercentage >= blueChipRange[0] && blueChipPercentage <= blueChipRange[1];
    const meetsAudit = !requiresAudit || hasAudit;
    
    const meetsCriteria = meetsMktCap && meetsLiquidity && meetsTop10 && meetsSniper && meetsBlueChip && meetsAudit;
    
    // Prepare analysis results
    const analysisData = {
      meetsCriteria,
      name: tokenInfo.name || "Unknown",
      symbol: tokenInfo.symbol || "Unknown",
      contractAddress: node.data.contractAddress,
      metrics: {
        marketCap,
        liquidity,
        top10Percentage,
        sniperScore,
        blueChipPercentage,
        hasAudit
      },
      checks: {
        meetsMktCap,
        meetsLiquidity,
        meetsTop10,
        meetsSniper,
        meetsBlueChip,
        meetsAudit
      },
      risk: riskData ? {
        score: riskData.risk_score || 0,
        rugged: riskData.is_rugged || false,
        details: riskData.risk_details || []
      } : {
        score: 0,
        rugged: false,
        details: []
      }
    };
    
    // Return analysis results
    return {
      analysisData,
      content: node.data.contractAddress,
      summary: meetsCriteria ? 'Criteria passed' : 'Criteria not met'
    };
  } catch (error) {
    console.error('Error in analyst agent handler:', error);
    
    // Return structured error response with default analysisData
    return {
      error: error.message || "An error occurred during analysis",
      analysisData: {
        meetsCriteria: false,
        name: "Error",
        symbol: "ERR",
        contractAddress: node.data.contractAddress || "",
        metrics: {
          marketCap: 0,
          liquidity: 0,
          top10Percentage: 0,
          sniperScore: 0,
          blueChipPercentage: 0,
          hasAudit: false
        },
        checks: {
          meetsMktCap: false,
          meetsLiquidity: false,
          meetsTop10: false,
          meetsSniper: false,
          meetsBlueChip: false,
          meetsAudit: false
        },
        risk: {
          score: 0,
          rugged: false,
          details: []
        }
      }
    };
  }
}

module.exports = analystAgentHandler; 