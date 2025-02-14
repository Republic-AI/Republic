const axios = require('axios');
const web3 = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');

async function analystAgentHandler(node) {
  try {
    const { contractAddress, parameters } = node.data;

    if (!contractAddress) {
      return { error: "No contract address provided" };
    }

    // 1. Connect to Solana using your QuickNode endpoint
    const connection = new web3.Connection(
      "https://attentive-lingering-general.solana-mainnet.quiknode.pro/b510e1a738a9447f3a963bc61b7f002287b72eb1/",
      { commitment: 'confirmed' }
    );

    // 2. Create Metaplex instance
    const metaplex = Metaplex.make(connection);

    // 3. Get the Token's Mint Address
    let mint;
    try {
      mint = new web3.PublicKey(contractAddress);
    } catch (error) {
      return { error: `Invalid contract address: ${contractAddress}` };
    }

    // 4. Fetch metadata with error handling
    let metadata;
    try {
      metadata = await metaplex.nfts().findByMint({ mintAddress: mint });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      // Return minimal data if metadata fetch fails
      metadata = {
        name: 'Unknown',
        symbol: 'UNKNOWN',
        uri: '',
      };
    }

    // 5. Get Token Supply with error handling
    let tokenSupply = 0;
    try {
      const tokenSupplyInfo = await connection.getTokenSupply(mint);
      if (tokenSupplyInfo?.value?.uiAmount) {
        tokenSupply = tokenSupplyInfo.value.uiAmount;
      }
    } catch (error) {
      console.error('Error fetching token supply:', error);
    }

    // 6. Get Largest Token Holders with error handling
    let top10Holders = [];
    let top10Supply = 0;
    try {
      const largestAccounts = await connection.getTokenLargestAccounts(mint);
      if (largestAccounts?.value) {
        top10Holders = largestAccounts.value.slice(0, 10).map(holder => ({
          address: holder.address.toBase58(),
          amount: holder.uiAmount || 0,
        }));
        top10Supply = top10Holders.reduce((sum, holder) => sum + (holder.amount || 0), 0);
      }
    } catch (error) {
      console.error('Error fetching largest accounts:', error);
    }

    // 7. Get Total Number of Token Holders with error handling
    let numHolders = 0;
    try {
      const tokenAccounts = await connection.getProgramAccounts(
        new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        {
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: mint.toBase58(),
              },
            },
            {
              dataSize: 165,
            }
          ],
          dataSlice: { offset: 0, length: 0 }, // Only fetch account keys, not data
        }
      );
      numHolders = tokenAccounts.length;
    } catch (error) {
      console.error('Error fetching holder count:', error);
    }

    // 8. Construct the filtered data
    const filteredData = {
      contractAddress: contractAddress,
      name: metadata?.name || 'Unknown',
      symbol: metadata?.symbol || 'UNKNOWN',
      uri: metadata?.uri || '',
      marketCap: 0,
      liquidity: 0,
      holders: numHolders,
      top10Holders,
      top10Supply,
      top10Percent: tokenSupply > 0 ? (top10Supply / tokenSupply) * 100 : 0,
      tokenSupply,
      meetsCriteria:
        0 >= parameters.mktCap &&
        0 >= parameters.liquidity &&
        numHolders >= parameters.holders,
    };

    return {
      analysisData: filteredData
    };
  } catch (error) {
    console.error('Error in analyst agent handler:', error);
    
    // More specific error handling
    if (error.name === 'NotFoundError') {
      return { error: `Token not found: ${contractAddress}` };
    } else if (error.name === 'TypeError') {
      return { error: `Invalid data received: ${error.message}` };
    } else if (error.code === 'ERR_STRING_TOO_LONG') {
      return { error: 'Response data too large, try with a different token' };
    } else {
      return { error: `Analysis failed: ${error.message}` };
    }
  }
}

module.exports = analystAgentHandler; 