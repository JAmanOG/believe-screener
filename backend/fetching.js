import { time, timeStamp } from 'console';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import dotenv from 'dotenv';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEX_PRIORITY = {
    orca: 1,
    raydium: 0.95,
    meteora: 0.9,
    lifinity: 0.85
  };
  

function scorePair(pair) {
  const liquidityScore = Math.min(pair.liquidity.usd || 0, 1_000_000) / 1_000_000;
  const volumeScore = Math.min(pair.volume?.h24 || 0, 1_000_000) / 1_000_000;
  const dexScore = DEX_PRIORITY[pair.dexId] || 0.5;
  const ageScore = Date.now() - (pair.pairCreatedAt || 0) > 1000 * 60 * 60 * 12 ? 1 : 0.5; // 12h old = decent

  // Weighted average
  return (
    0.4 * liquidityScore +
    0.3 * volumeScore +
    0.2 * dexScore +
    0.1 * ageScore
  );
}

// output of below function
// 🏆 Best Pair: {
//     chainId: 'solana',
//     dexId: 'meteora',
//     url: 'https://dexscreener.com/solana/6zvxszzax2ffb5mxeunbgdxscdzpnmyw42zxaakvngmj',
//     pairAddress: '6ZvXsZZAX2ffB5MXEuNBgdXScdZpnmyw42ZxaAKVnGmj',
//     labels: [ 'DYN' ],
//     baseToken: {
//       address: '97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy',
//       name: 'Startup',
//       symbol: 'STARTUP'
//     },
//     quoteToken: {
//       address: 'So11111111111111111111111111111111111111112',
//       name: 'Wrapped SOL',
//       symbol: 'SOL'
//     },
//     priceNative: '0.00009896',
//     priceUsd: '0.01428',
//     txns: {
//       m5: { buys: 2, sells: 4 },
//       h1: { buys: 36, sells: 95 },
//       h6: { buys: 308, sells: 318 },
//       h24: { buys: 985, sells: 917 }
//     },
//     volume: { h24: 1059398.3, h6: 364333.34, h1: 75017.74, m5: 3254.02 },
//     priceChange: { m5: -4.59, h1: 5.39, h6: 10.69, h24: 26.81 },
//     liquidity: { usd: 798259.58, base: 27721448, quote: 2786.2214 },
//     fdv: 14147674,
//     marketCap: 14147674,
//     pairCreatedAt: 1747147386000,
//     info: {
//       imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy.png?key=c157c8',    
//       header: 'https://dd.dexscreener.com/ds-data/tokens/solana/97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy/header.png?key=c157c8',
//       openGraph: 'https://cdn.dexscreener.com/token-images/og/solana/97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy?timestamp=1750879800000',
//       websites: [],
//       socials: [ [Object] ]
//     },
//     _score: 0.899303832
//   }

async function getPairsByTokenAddress(tokenAddress) {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${tokenAddress}`);
    const data = await res.json();
  
    const filtered = data.pairs
      .filter(p => p.baseToken.address.toLowerCase() === tokenAddress.toLowerCase())
      .map(p => ({
        ...p,
        _score: scorePair(p)
      }))
      .sort((a, b) => b._score - a._score);
  
    const outputPath = path.join(__dirname, 'bestPairFiltered.json');
    fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));
    console.log(`Filtered + Scored data saved to: ${outputPath}`);
  
    return filtered;
  }
    
//   const tokenAddress = '97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy';
//   const data = await getPairsByTokenAddress(tokenAddress);
//   const bestPair = data[0];
//   console.log('🏆 Best Pair:', data[0]);

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

const resultgetTradeStats = await getTradeStats(
    'solana',
    "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
    "So11111111111111111111111111111111111111112",
    "4AZRPNEfCJ7iw28rJu5aUyeQhYcvdcNm8cswyL51AY9i"
);

//   Trade Stats Result: {
//     "data": {
//       "Solana": {
//         "DEXTradeByTokens": [
//           {
//             "buy_volume": "1219115359.3040311",
//             "buys": "1513593",
//             "sell_volume": "1213153923.576127",
//             "sells": "1465727",
//             "traded_volume": "2432269282.880158",
//             "trades": "2979320"
//           }
//         ]
//       }
//     }
//   }
  
//   const alltimetradingActivity = { 
//     totalTrades: resultgetTradeStats.data.Solana.DEXTradeByTokens[0].trades,
//     totalVolume: resultgetTradeStats.data.Solana.DEXTradeByTokens[0].traded_volume,
//     totalBuys: resultgetTradeStats.data.Solana.DEXTradeByTokens[0].buys,
//     totalSells: resultgetTradeStats.data.Solana.DEXTradeByTokens[0].sells,
//     totalBuyVolume: resultgetTradeStats.data.Solana.DEXTradeByTokens[0].buy_volume,
//     totalSellVolume: resultgetTradeStats.data.Solana.DEXTradeByTokens[0].sell_volume
//   }

//     {
//     "token": "STARTUP",
//     "tokenName": "Startup",
//     "tradeCA": "https://axiom.trade/t/97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy/@bscreener",
//     "price": "$0.013298",
//     "marketCap": "$13.17M",
//     "marketCapValue": 13170000,
//     "change30m": "↓2.73%",
//     "change24h": "↑45.71%",
//     "change24hValue": 45.71,
//     "volume24h": "$2.31M",
//     "volume24hValue": 2310000,
//     "liquidityFull": {
//       "liquidity": "1.17M",
//       "buy": "4.52K",
//       "sell": "4.15K"
//     },
//     "liquidity": "1.17M",
//     "buyPressure": "4.52K",
//     "sellPressure": "4.15K",
//     "holders": "6K",
//     "age": "1mo"
//   },

// 🏆 Best Pair: {
//     chainId: 'solana',
//     dexId: 'meteora',
//     url: 'https://dexscreener.com/solana/6zvxszzax2ffb5mxeunbgdxscdzpnmyw42zxaakvngmj',
//     pairAddress: '6ZvXsZZAX2ffB5MXEuNBgdXScdZpnmyw42ZxaAKVnGmj',
//     labels: [ 'DYN' ],
//     baseToken: {
//       address: '97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy',
//       name: 'Startup',
//       symbol: 'STARTUP'
//     },
//     quoteToken: {
//       address: 'So11111111111111111111111111111111111111112',
//       name: 'Wrapped SOL',
//       symbol: 'SOL'
//     },
//     priceNative: '0.00009252',
//     priceUsd: '0.01330',
//     txns: {
//       m5: { buys: 2, sells: 3 },
//       h1: { buys: 42, sells: 32 },
//       h6: { buys: 315, sells: 367 },
//       h24: { buys: 1143, sells: 1079 }
//     },
//     volume: { h24: 1300638.4, h6: 373307.18, h1: 56719.31, m5: 2640.79 },
//     priceChange: { m5: -1.02, h1: -5.77, h6: 17.45, h24: 53.06 },
//     liquidity: { usd: 768852.91, base: 29115273, quote: 2651.6436 },
//     fdv: 13178776,
//     marketCap: 13178776,
//     pairCreatedAt: 1747147386000,
//     info: {
//       imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy.png?key=c157c8',    
//       header: 'https://dd.dexscreener.com/ds-data/tokens/solana/97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy/header.png?key=c157c8',
//       openGraph: 'https://cdn.dexscreener.com/token-images/og/solana/97PVGU2DzFqsAWaYU17ZBqGvQFmkqtdMywYBNPAfy8vy?timestamp=1750868700000',
//       websites: [],
//       socials: [ [Object] ]
//     },
//     _score: 0.887541164
//   }

// return candles for a specific pool on a specific network
async function fetchGeckoCandles(network, poolAddress, timeframe) {
    const url = `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}`;
    try {
      console.log(`Fetching candles from: ${url}`);
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          console.warn(`Candles not found for ${url}, returning empty array.`);
          return [];
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      const data = json.data.attributes.ohlcv_list.map(c => ({
        timestamp: c[0],
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4],
        volume: c[5]
      }));
      // Convert timestamps to milliseconds
      return data.map(candle => ({
        ...candle,
        timestamp: new Date(candle.timestamp * 1000).toISOString()
      }));
    } catch (err) {
      console.warn(`Error fetching candles for ${url}: ${err.message}`);
      return [];
    }
  }

// Usage:
// const candles = await fetchGeckoCandles(
//   "solana",
//   "6ZvXsZZAX2ffB5MXEuNBgdXScdZpnmyw42ZxaAKVnGmj",
//   "hour"
// );
// console.log(candles);


//output of below function
// {
//   base_token_price_usd: '0.0149894015616214883601442269164990720145422693717925891533890098',
//   base_token_price_native_currency: '0.000103554263461699',
//   quote_token_price_usd: '144.524149576604608928322718048674819227092493314',
//   quote_token_price_native_currency: '1.0',
//   base_token_price_quote_token: '0.0001035542635',
//   quote_token_price_base_token: '9656.772850978',
//   address: '6ZvXsZZAX2ffB5MXEuNBgdXScdZpnmyw42ZxaAKVnGmj',
//   name: 'STARTUP / SOL',
//   pool_name: 'STARTUP / SOL',
//   pool_fee_percentage: null,
//   pool_created_at: '2025-05-13T14:43:08Z',
//   fdv_usd: '14843814.0994932',
//   market_cap_usd: '14843814.0978875',
//   price_change_percentage: {
//     m5: '5.16',
//     m15: '3.59',
//     m30: '3.71',
//     h1: '7.1',
//     h6: '11.02',
//     h24: '29.88'
//   },
//   transactions: {
//     m5: { buys: 6, sells: 3, buyers: 5, sellers: 3 },
//     m15: { buys: 8, sells: 19, buyers: 7, sellers: 15 },
//     m30: { buys: 21, sells: 53, buyers: 14, sellers: 30 },
//     h1: { buys: 37, sells: 89, buyers: 23, sellers: 57 },
//     h6: { buys: 301, sells: 309, buyers: 164, sellers: 210 },
//     h24: { buys: 955, sells: 867, buyers: 460, sellers: 464 }
//   },
//   volume_usd: {
//     m5: '3890.4953927001',
//     m15: '8216.4643801786',
//     m30: '34983.9741512171',
//     h1: '72549.9480622935',
//     h6: '364852.04522743',
//     h24: '1060241.96850196'
//   },
//   reserve_in_usd: '783258.0682',
//   locked_liquidity_percentage: '98.7606361796988'
// }

// get all trading activity for a pool on a specific network

async function fetch24hrsTimeTradingActivity(network, poolId) {
    const url = `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolId}`;
    try {
        console.log(`Fetching all-time trading activity from: ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
            // If 404 or any error, return empty object instead of throwing
            if (res.status === 404) {
                console.warn(`Trading activity not found for ${url}, returning empty object.`);
                return {};
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const json = await res.json();
        const newdata = json.data.attributes;
        const tradingActivity = {
            totalTrades: newdata.transactions.h24.buys + newdata.transactions.h24.sells,
            uniqueWallets: newdata.transactions.h24.buyers + newdata.transactions.h24.sellers,
            buys: newdata.transactions.h24.buys,
            sells: newdata.transactions.h24.sells,
            volume: newdata.volume_usd.h24
        };
        return tradingActivity;
    } catch (err) {
        // For any error, log and return empty object
        console.warn(`Error fetching trading activity for ${url}: ${err.message}`);
        return {};
    }
}

// Usage:
// const tradingActivity = await fetch24hrsTimeTradingActivity(
//     "solana",
//     "6ZvXsZZAX2ffB5MXEuNBgdXScdZpnmyw42ZxaAKVnGmj"
// );
// console.log(tradingActivity);

export const individualComponent = async(data) => {
    try {
        console.log(`Entered individualComponent with data:`, data);

        //saving data to a file
        const tempoutputPath = path.join(__dirname, 'gettingData.json');
        fs.writeFileSync(tempoutputPath, JSON.stringify(data, null, 2));
        console.log(`Data saved to: ${tempoutputPath}`);

        const { token, tokenName, tradeCA, price, marketCap, marketCapValue, change30m, change24h, change24hValue, volume24h, volume24hValue, liquidityFull, liquidity, buyPressure, sellPressure, holders, age } = data;
        
        const address = tradeCA.split('/t/')[1].split('/@')[0];
        console.log(`Fetching best pair for token: ${token} (${address})`);
        
        const oldbestPair = await getPairsByTokenAddress(address);
        const bestPair = oldbestPair?.[0] || null; // Get the best pair based on scoring

        console.log(`🏆 Best Pair:`, bestPair);
        if (!bestPair) {
            console.warn(`No pairs found for token: ${token}`);
            return null;
        }

        const tradingActivityParams = {
            network: bestPair.chainId,
            poolId: bestPair.pairAddress
        };
        
        const candlesParams = {
            network: bestPair.chainId,
            poolAddress: bestPair.pairAddress,
        };

        const days = await fetchGeckoCandles(candlesParams.network, candlesParams.poolAddress, 'day') || [];
        const hours = await fetchGeckoCandles(candlesParams.network, candlesParams.poolAddress, 'hour') || [];

        const candlesAllFrame = {
            hours: hours,
            days: days,
        }
        
        const fetchedtradingActivityData = await fetch24hrsTimeTradingActivity(
            tradingActivityParams.network,
            tradingActivityParams.poolId
        ) || {};

        const getTradeStatsParams = {
            chainId: bestPair.chainId,
            token: bestPair.baseToken?.address,
            sideToken: bestPair.quoteToken?.address,
            pairAddress: bestPair.pairAddress
        };

        const resultgetTradeStats = await getTradeStats(getTradeStatsParams.chainId,
        getTradeStatsParams.token,
        getTradeStatsParams.sideToken,
        getTradeStatsParams.pairAddress
      ) || {};

      const highPrice = candlesAllFrame.days.reduce((max, c) => Math.max(max, c.high), 0);
      const lowPrice = candlesAllFrame.days.reduce((min, c) => Math.min(min, c.low), Infinity);
      const closePrice = candlesAllFrame.days[candlesAllFrame.days.length - 1]?.close || 0;
      const openPrice = candlesAllFrame.days[0]?.open || 0;


        const basicInfo = {
            token: token,
            tokenName: tokenName,
            contractAddress: bestPair.pairAddress,
            tradeUrl: tradeCA,
            chainId: bestPair.chainId,
            dexId: bestPair.dexId,
            isVerified: true
        }

        // Price & OHLC Data
        const livepriceData = {
            currentPrice: bestPair.priceUsd,
            priceNative: bestPair.priceNative,
            timeStamp: new Date().toISOString(),
        }

        const dailyPriceSummary = {
            openPrice: openPrice.toFixed(5),
            highPrice: highPrice.toFixed(5),
            lowPrice: lowPrice.toFixed(5),
            closePrice: closePrice.toFixed(5),
        }

        const ohlcData = candlesAllFrame;

        // Performance Chart Data
        const performanceData = {
            timeStamp: new Date().toISOString(),
            price: bestPair.priceUsd,
            volume: bestPair.volume?.h24,
            marketCap: bestPair.marketCap,
            liquidity: bestPair.liquidity?.usd
        };

        // Multi-Timeframe Momentum
        const momentumData = {
            m5: bestPair.priceChange?.m5,
            h1: bestPair.priceChange?.h1,
            h6: bestPair.priceChange?.h6,
            h24: bestPair.priceChange?.h24
        };

        const liquidityData = {
            usd: bestPair.liquidity?.usd,
            base: bestPair.liquidity?.base,
            quote: bestPair.liquidity?.quote
        };

        const tokenAge = {
            pairCreatedAt: bestPair.pairCreatedAt,
        };

        const alltimetradingActivity = { 
            totalTrades: resultgetTradeStats.data?.Solana?.DEXTradeByTokens?.[0]?.trades,
            totalVolume: resultgetTradeStats.data?.Solana?.DEXTradeByTokens?.[0]?.traded_volume,
            totalBuys: resultgetTradeStats.data?.Solana?.DEXTradeByTokens?.[0]?.buys,
            totalSells: resultgetTradeStats.data?.Solana?.DEXTradeByTokens?.[0]?.sells,
            totalBuyVolume: resultgetTradeStats.data?.Solana?.DEXTradeByTokens?.[0]?.buy_volume,
            totalSellVolume: resultgetTradeStats.data?.Solana?.DEXTradeByTokens?.[0]?.sell_volume
          }
        
          const dailyTradingActivity = fetchedtradingActivityData

          const mediaImages = {
            imageUrl: bestPair.info?.imageUrl,
            header: bestPair.info?.header,
            openGraph: bestPair.info?.openGraph
        };

        const socialLinks = {
            websites: bestPair.info?.websites || [],
            socials: bestPair.info?.socials || []
        };
        
          // saving all data to a file
        const outputData = {
            basicInfo,
            livepriceData,
            dailyPriceSummary,
            ohlcData,
            performanceData,
            momentumData,
            liquidityData,
            tokenAge,
            tradingActivity:{
                allTime: alltimetradingActivity,
                last24h: dailyTradingActivity
            },
            mediaImages,
            socialLinks
        };

        const outputPath = path.join(__dirname, 'individualComponentData.json');
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        console.log(`Individual component data saved to: ${outputPath}`);
        
        return outputData
    } catch (err) {
        console.error("Error in individualComponent:", err);
        return null;
    }
};


    // individualComponent({
    //     "token": "DUPE",
    //     "tokenName": "Dupe",
    //     "tradeCA": "https://axiom.trade/t/fRfKGCriduzDwSudCwpL7ySCEiboNuryhZDVJtr1a1C/@bscreener",
    //     "price": "$0.021350",
    //     "marketCap": "$21.35M",
    //     "marketCapValue": 21350000,
    //     "change30m": "↓1.43%",
    //     "change24h": "↓11.40%",
    //     "change24hValue": 11.4,
    //     "volume24h": "$989.60K",
    //     "volume24hValue": 989600,
    //     "liquidityFull": {
    //       "liquidity": "2.17M",
    //       "buy": "2.79K",
    //       "sell": "1.94K"
    //     },
    //     "liquidity": "2.17M",
    //     "buyPressure": "2.79K",
    //     "sellPressure": "1.94K",
    //     "holders": "7K",
    //     "age": "1mo"
    //     }
    // ).catch(err => {
    //     console.error("Error in individualComponent:", err);
    // });  