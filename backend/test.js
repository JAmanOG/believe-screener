const getTradeStats = async (chainId = 'solana', token, sideToken, pairAddress) => {
    const myHeaders = new Headers();
    const apikey = process.env.BITQUERY_API_KEY;
    if (!apikey) {
        throw new Error("BITQUERY_API_KEY is not set in environment variables");
    }

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${apikey}`);
    
    const chainMap = {
        solana: 'Solana',
        ethereum: 'Ethereum',
        polygon: 'Polygon',
        bsc: 'BSC',
        arbitrum: 'Arbitrum',
        avalanche: 'Avalanche'
    };
    
    const gqlChain = chainMap[chainId];
    
    if (!gqlChain) {
        throw new Error(`Unsupported chain: ${chainId}`);
    }
    
    const query = `
        query GetAllTimeTradeStats($token: String!, $side_token: String!, $pair_address: String!) {
            ${gqlChain}(dataset: combined) {
                DEXTradeByTokens(
                    where: {
                        Transaction: { Result: { Success: true } }
                        Trade: {
                            Currency: { MintAddress: { is: $token } }
                            Side: { Currency: { MintAddress: { is: $side_token } } }
                            Market: { MarketAddress: { is: $pair_address } }
                        }
                    }
                ) {
                    trades: count
                    traded_volume: sum(of: Trade_Side_AmountInUSD)
                    buy_volume: sum(
                        of: Trade_Side_AmountInUSD
                        if: { Trade: { Side: { Type: { is: buy } } } }
                    )
                    sell_volume: sum(
                        of: Trade_Side_AmountInUSD
                        if: { Trade: { Side: { Type: { is: sell } } } }
                    )
                    buys: count(if: { Trade: { Side: { Type: { is: buy } } } })
                    sells: count(if: { Trade: { Side: { Type: { is: sell } } } })
                }
            }
        }
    `;
    
    const variables = {
        token,
        side_token: sideToken,
        pair_address: pairAddress
    };
    
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ query, variables }),
        redirect: "follow"
    };
    
    try {
        const response = await fetch("https://streaming.bitquery.io/eap", requestOptions);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    }
};

// Example usage:
const result = await getTradeStats(
  'solana',
  "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
  "So11111111111111111111111111111111111111112",
  "4AZRPNEfCJ7iw28rJu5aUyeQhYcvdcNm8cswyL51AY9i"
);

console.log("Trade Stats Result:", JSON.stringify(result, null, 2));