const analystAgentHandler = require('./handlers/analystAgent');

async function testAnalyst() {
  // Test tokens
  const tokens = [
    {
      name: 'BONK',
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
    },
    {
      name: 'USDC',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    }
  ];

  const parameters = {
    mktCap: 100000,        // $100K minimum market cap
    liquidity: 50000,      // $50K minimum liquidity
    holders: 100,          // Minimum 100 holders
    snipers: 0,            // Not using sniper score for test
    blueChip: 0,           // Not using blue chip percentage for test
    top10: 80,            // Maximum 80% held by top 10
    hasAudit: false       // Not requiring audit for test
  };

  for (const token of tokens) {
    try {
      console.log(`\nTesting ${token.name} token analysis...`);
      const result = await analystAgentHandler({
        data: {
          contractAddress: token.address,
          parameters
        }
      });
      console.log(`${token.name} Analysis Result:`, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(`Test failed for ${token.name}:`, error);
    }
  }
}

testAnalyst(); 