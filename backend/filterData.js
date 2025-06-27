import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to parse numerical values from strings
function parseValue(value) {
    if (!value || value === "N/A") return 0;

    //This will remove any non-numeric characters except M, K, B
    const cleaned = value.replace(/[$,↑↓%]/g, "").trim();
    if (cleaned.includes("M")) {
        return parseFloat(cleaned.replace("M", "")) * 1000000;
    } else if (cleaned.includes("K")) {
        return parseFloat(cleaned.replace("K", "")) * 1000;
    } else if (cleaned.includes("B")) {
        return parseFloat(cleaned.replace("B", "")) * 1000000000;
    }
    
    return parseFloat(cleaned) || 0;
}

// Function to extract liquidity info
function parseLiquidityInfo(liquidityStr) {
    if (!liquidityStr) return { liquidity: "0", buy: "0", sell: "0" };
    
    const liqMatch = liquidityStr.match(/LIQ: \$([0-9.]+[KM]?)/);
    const buyMatch = liquidityStr.match(/Buy: ([0-9.]+[KM]?)/);
    const sellMatch = liquidityStr.match(/Sell: ([0-9.]+[KM]?)/);
    
    return {
        liquidity: liqMatch ? liqMatch[1] : "0",
        buy: buyMatch ? buyMatch[1] : "0",
        sell: sellMatch ? sellMatch[1] : "0"
    };
}

// Main filtering function
function filterAndFormatData(tableData, otherData) {
    console.log("🚀 Starting Believe Screener Data Filter...\n");
    
    try {
        if (!Array.isArray(tableData) || tableData.length === 0) {
            console.error("❌ No data provided or data is not in the expected format!");
            return [];
        }

        
        const rawData = JSON.parse(JSON.stringify(tableData));
        
        // Process the data
        const processedData = [];
        
        rawData.forEach((row, index) => {
            try {
                if (!Array.isArray(row) || row.length < 10) {
                    console.warn(`⚠️  Skipping invalid row ${index + 1}`);
                    return;
                }
                
                const [tokenInfo, tradeCA, price, marketCap, change30m, change24h, volume24h, liquidityInfo, holders, age] = row;
                
                // Extract token name and symbol
                const tokenParts = tokenInfo.split('\n');
                const tokenSymbol = tokenParts[0];
                const tokenName = tokenParts[1] || tokenSymbol;
                
                // Parse numerical values for filtering
                const marketCapValue = parseValue(marketCap);
                const volume24hValue = parseValue(volume24h);
                const change24hValue = (() => {
                    if (!change24h) return 0;
                    const isNegative = change24h.includes('↓');
                    const cleaned = change24h.replace(/[↑↓%]/g, "");
                    const value = parseFloat(cleaned) || 0;
                    return isNegative ? -value : value;
                })();
                
                // Parse liquidity info
                const liqInfo = parseLiquidityInfo(liquidityInfo);
                
                const token = {
                    token: tokenSymbol,
                    tokenName: tokenName,
                    tradeCA: tradeCA,
                    price: price,
                    marketCap: marketCap,
                    marketCapValue: marketCapValue,
                    change30m: change30m,
                    change24h: change24h,
                    change24hValue: change24hValue,
                    volume24h: volume24h,
                    volume24hValue: volume24hValue,
                    liquidityFull: {
                        liquidity: liqInfo.liquidity,
                        buy: liqInfo.buy,
                        sell: liqInfo.sell
                    },
                    liquidity: liqInfo.liquidity,
                    buyPressure: liqInfo.buy,
                    sellPressure: liqInfo.sell,
                    holders: holders,
                    age: age
                };
                
                processedData.push(token);
                
            } catch (rowError) {
                console.warn(`⚠️  Error processing row ${index + 1}:`, rowError.message);
            }
        });
        
        console.log(`✅ Successfully processed ${processedData.length} tokens\n`);
        
        // Apply filters - you can customize these criteria
        const filtered = processedData.filter(token => {
            return token.marketCapValue >= 100000 && // Min market cap $100K
                   token.volume24hValue >= 1000;      // Min 24h volume $1K
        });
        
        const outputPath = path.join(__dirname, "filteredDataWithOther.json");
        const outputData = {
            otherData: otherData, // Include other data like global stats, major card details, etc.
            tableData: filtered
        };
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        console.log(`\n💾 Filtered data with other info saved to: ${outputPath}`);

        return filtered;
        
    } catch (error) {
        console.error("❌ Error filtering data:", error.message);
        console.error("Stack:", error.stack);
        return [];
    }
}

// Export the function
export { filterAndFormatData };

// Run the filter directly

// filterAndFormatData();