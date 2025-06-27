import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { filterAndFormatData } from "./filterData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const userDataDir = path.join(__dirname, "chrome-data");

// const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";

async function extractGlobalStats(page) {
    return await page.evaluate(() => {
        const cardContent = document.querySelector('[data-slot="card-content"]');
        if (!cardContent) return null;
        
        const stats = [];
        
        // Extract from desktop view first
        const desktopSections = cardContent.querySelectorAll('.hidden.sm\\:flex .flex-1');
        
        if (desktopSections.length > 0) {
            desktopSections.forEach(section => {
                const titleElement = section.querySelector('h2');
                const valueElement = section.querySelector('p.text-2xl, p.text-3xl');
                const subDetailElement = section.querySelector('p.text-xs.text-muted-foreground');
                
                if (titleElement && valueElement) {
                    stats.push({
                        title: titleElement.textContent.trim(),
                        value: valueElement.textContent.trim(),
                        subDetail: subDetailElement ? subDetailElement.textContent.trim() : '',
                        type: titleElement.textContent.toLowerCase().replace(/\s+/g, '-')
                    });
                }
            });
        } else {
            // Fallback to mobile view
            const mobileSection = cardContent.querySelector('.sm\\:hidden');
            if (mobileSection) {
                // Lifetime Volume (mobile)
                const lifetimeSection = mobileSection.querySelector('.mb-4');
                if (lifetimeSection) {
                    const title = lifetimeSection.querySelector('h2');
                    const value = lifetimeSection.querySelector('p.text-3xl');
                    const subDetail = lifetimeSection.querySelector('p.text-xs');
                    
                    if (title && value) {
                        stats.push({
                            title: title.textContent.trim(),
                            value: value.textContent.trim(),
                            subDetail: subDetail ? subDetail.textContent.trim() : '',
                            type: 'lifetime-volume'
                        });
                    }
                }
                
                // Other sections (mobile)
                const otherSections = mobileSection.querySelectorAll('.flex.items-start.justify-around .flex.flex-col');
                otherSections.forEach(section => {
                    const title = section.querySelector('h2');
                    const value = section.querySelector('p.text-3xl');
                    const subDetail = section.querySelector('p.text-xs');
                    
                    if (title && value) {
                        stats.push({
                            title: title.textContent.trim(),
                            value: value.textContent.trim(),
                            subDetail: subDetail ? subDetail.textContent.trim() : '',
                            type: title.textContent.toLowerCase().replace(/\s+/g, '-')
                        });
                    }
                });
            }
        }
        
        return stats;
    });
}

async function extractMajorCardDetails(page) {
    return await page.evaluate(() => {
        const majorCard = document.querySelector('.grid.gap-4.grid-cols-2.md\\:grid-cols-2.lg\\:grid-cols-4');
        if (!majorCard) return null;
        
        const details = [];
        const cards = majorCard.querySelectorAll('[data-slot="card-content"]');
        
        cards.forEach((card, index) => {
            const titleElement = card.querySelector('.text-xl.font-extrabold');
            const valueElement = card.querySelector('.text-3xl.font-extrabold');
            const subDetails = card.querySelectorAll('.text-base.text-gray-400.font-semibold.font-mono');
            
            if (titleElement && valueElement) {
                const cardData = {
                    title: titleElement.textContent.trim(),
                    value: valueElement.textContent.trim(),
                    subDetails: []
                };
                
                subDetails.forEach(detail => {
                    cardData.subDetails.push(detail.textContent.trim());
                });
                
                details.push(cardData);
            }
        });
        
        return details;
    });
}

async function extractNewLaunchTableData(page) {
    return await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table[data-slot="table"] tbody tr[data-slot="table-row"]'));
        return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td[data-slot="table-cell"]'));
            
            // Token info (symbol and name)
            const tokenCell = cells[0];
            const tokenSymbol = tokenCell?.querySelector('.text-xl.font-semibold.font-mono')?.textContent?.trim() || '';
            const tokenName = tokenCell?.querySelector('.text-sm.text-muted-foreground')?.textContent?.trim() || '';
            
            // Curve percentage
            const curveCell = cells[1];
            const curvePercentage = curveCell?.querySelector('.text-xl.font-bold.text-foreground')?.textContent?.trim() || '0';
            
            // Trade/CA info
            const tradeCell = cells[2];
            const contractAddress = tradeCell?.querySelector('span.text-xs.font-mono.text-muted-foreground')?.textContent?.trim() || '';
            const tradeLink = tradeCell?.querySelector('a[href*="axiom.trade"]')?.href || '';
            
            // Twitter info
            const twitterCell = cells[3];
            const twitterHandle = twitterCell?.querySelector('a[href*="twitter.com"]')?.textContent?.trim() || '';
            const twitterLink = twitterCell?.querySelector('a[href*="twitter.com"]')?.href || '';
            
            // Description
            const descriptionCell = cells[4];
            const description = descriptionCell?.querySelector('span')?.textContent?.trim() || descriptionCell?.querySelector('.truncate')?.textContent?.trim() || '';

            // Image URL extraction
            let imageUrl = '';
            const imageElement = tokenCell?.querySelector('img');
            if (imageElement) {
                imageUrl = imageElement.getAttribute('src') || '';
            }
            
            // Launch time
            const launchCell = cells[5];
            const launchTime = launchCell?.querySelector('.text-muted-foreground\\/90.font-mono')?.textContent?.trim() || '';
            
            return {
                token: {
                    symbol: tokenSymbol,
                    name: tokenName
                },
                imageUrl: imageUrl,
                curvePercentage: curvePercentage,
                contract: {
                    address: contractAddress,
                    tradeLink: tradeLink
                },
                twitter: {
                    handle: twitterHandle,
                    link: twitterLink
                },
                description: description,
                launchTime: launchTime
            };
        });
    });
}

// Call the scrapeData function to start scraping

export async function scrapeData() {    
    const url = "https://www.believescreener.com";

    const browser = await puppeteer.launch({
        headless: true,
        // userDataDir: userDataDir,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        ignoreHTTPSErrors: true,
        protocolTimeout: 120000,
        executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
  
    // });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.setViewport({width: 1080, height: 1024});

    console.log("Waiting for page to load...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    let currentTab = 'top-gainers';
    let newLaunchTableData = [];
    let filteredData = [];
    let intervalCounter = 0;

    async function runInterval() {
        intervalCounter++;
        console.log(`\n🔄 Interval ${intervalCounter} - Current tab: ${currentTab}`);

        try {

            if (intervalCounter % 3 === 0) {

                // console.log('Time to switch to New Launches tab... 15 seconds passed');
                if (currentTab !== 'new-launches') {
                    // console.log('Clicking New Launches tab...');
                    await page.click('[id*="trigger-recent-launches"]');
                    currentTab = 'new-launches';

                    // Wait for tab to load
                    // console.log(' Waiting for New Launches tab to load...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    try {
                        await page.waitForSelector('table[data-slot="table"] tbody tr', { timeout: 5000 });
                        // console.log('New Launches table found');
                    } catch (error) {
                        console.log('Table not found in New Launches tab, continuing...');
                    }

                    // Extract new launches
                    newLaunchTableData = await extractNewLaunchTableData(page);
                    console.log(`Extracted ${newLaunchTableData.length} new launches from Believe Screener`);

                    // Save New Launches data
                    const globalStats = await extractGlobalStats(page);
                    const majorCardDetails = await extractMajorCardDetails(page);

                    const otherData = {
                        globalStats: globalStats,
                        majorCardDetails: majorCardDetails,
                        newLaunchTableData: newLaunchTableData,
                    };

                    const outputPath = path.join(__dirname, "filteredDataWithOther.json");
                    const outputData = {
                        otherData: otherData,
                        tableData: filteredData,
                    };
                    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
                    console.log(`New Launches data saved: ${newLaunchTableData.length} items`);

                    // Stay for a bit longer
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // --- Switch back to Top 75 ---
                    console.log('Switching back to Top 75 tab...');
                    await page.click('[id*="trigger-all-tokens"]');
                    currentTab = 'top-gainers';

                    // Wait for Top 75 tab to load
                    console.log(' Waiting for Top 75 tab to load...');
                    await new Promise(resolve => setTimeout(resolve, 4000));
                    try {
                        await page.waitForSelector('table tbody tr', { timeout: 5000 });
                        console.log('Top 75 table loaded successfully');
                    } catch (error) {
                        console.log('Top 75 table taking longer to load...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    console.log('Successfully returned to Top 75 tab');
                }
            } else {
                // --- Extract Top 75 data ---
                if (currentTab === 'top-gainers') {
                    const tableData = await page.evaluate(() => {
                        const table = document.querySelector("table tbody");
                        if (!table) return [];
                        const rows = Array.from(table.querySelectorAll("tr"));
                        return rows.map(row => {
                            const columns = Array.from(row.querySelectorAll("td"));
                            return columns.map((col, index) => {
                                // Check if this cell contains a trade link
                                const tradeLink = col.querySelector('a[href*="axiom.trade"]');
                                if (tradeLink) {
                                    return tradeLink.href || tradeLink.getAttribute('href') || '';
                                }
                                return col.innerText?.trim() || '';
                            });
                        });
                    });

                    if (tableData.length > 0) {
                        console.log(`Successfully extracted ${tableData.length} rows from Top 75 tab`);
                        const globalStats = await extractGlobalStats(page);
                        const majorCardDetails = await extractMajorCardDetails(page);

                        const otherData = {
                            globalStats: globalStats,
                            majorCardDetails: majorCardDetails,
                            newLaunchTableData: newLaunchTableData,
                        };

                        if (tableData.length !== 0 || tableData[0].length !== 0) {
                            filteredData = filterAndFormatData(tableData, otherData);
                        } else {
                            console.log(`No valid data extracted from Top 75 tab`);
                        }

                        // Save Top 75 data if needed
                        const outputPath = path.join(__dirname, "filteredDataWithOther.json");
                        const outputData = {
                            otherData: otherData,
                            tableData: filteredData,
                        };
                        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
                        console.log(`Filtered data with other info saved to: ${outputPath}`);
                    } else {
                        console.log(`No data extracted from Top 75 tab`);
                    }
                } else {
                    console.log(`On ${currentTab} tab, skipping Top 75 data extraction`);
                }
            }
        } catch (error) {
            console.error("Error during scraping:", error);
        }

        // Wait 5 seconds before next interval
        setTimeout(runInterval, 5000);
    }

    // Start the first interval
    runInterval();
}


(async () => {
    try {
        await scrapeData();
    } catch (error) {
        console.error("Error during scraping:", error);
    }
})();