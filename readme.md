> **Note:** This project is created for educational and learning purposes.  
> **Disclaimer:** This is an unofficial app and is not affiliated with believescreener.com.

# BelieveScreener

BelieveScreener Native App is a full-stack platform for discovering, tracking, and analyzing Solana tokens in real time. The project consists of a robust backend for scraping, filtering, and aggregating token data, and a modern frontend that delivers live dashboards, analytics, and discovery tools to users. With features like real-time updates, advanced filtering, deep token analytics, and a responsive UI, BelieveScreener empowers users to stay ahead in the fast-moving Solana ecosystem.

## Demo Video

[Watch the demo video here](https://drive.google.com/file/d/1ZKE6LCD-Dj_z3zdPySEqx0Hea8-1vCge/view)


# BelieveScreener Backend

This backend powers the BelieveScreener platform, providing real-time and historical data for Solana tokens, including new launches, top gainers, and in-depth analytics. It is built with Node.js, Express, Puppeteer, and Socket.IO, and is designed for robust data scraping, filtering, and API delivery.

---

## Features

- **Automated Data Scraping**: Uses Puppeteer to scrape token data from [believescreener.com](https://believescreener.com), including new launches and top-performing tokens.
- **Data Filtering & Formatting**: Processes raw scraped data, applies custom filters (e.g., min market cap, volume), and formats it for frontend/API consumption.
- **Real-Time Data Updates**: Uses Socket.IO to push filtered data to all connected clients whenever the data file updates.
- **REST API**: Provides endpoints for status checks and detailed per-token analytics.
- **Token Analytics**: Fetches and aggregates data from external APIs (DexScreener, GeckoTerminal, Bitquery) for deep analytics, including OHLCV, liquidity, momentum, and trading activity.
- **Production-Ready**: Includes Dockerfile for containerization, PM2 for process management, and rate limiting for API protection.

---

## Folder Structure

```
backend/
  app.js                   # Main Express/Socket.IO server
  fetching.js              # Token analytics, external API fetchers
  filterData.js            # Data filtering and formatting logic
  scrapeData.js            # Puppeteer scraping logic
  filteredDataWithOther.json # Output: filtered + raw + stats data
  individualComponentData.json # Output: per-token analytics
  public/                  # Static files (index.html, SSL certs)
  Dockerfile               # Container build instructions
  ecosystem.config.cjs     # PM2 process manager config
  .env / .env.example      # Environment variables
  package.json             # Dependencies and scripts
```

---

## Data Flow & Implementation Details

### 1. Scraping & Data Extraction

- **scrapeData.js** launches a headless browser with Puppeteer, navigates to the main site, and extracts:
  - **Top 75 tokens**: Table data (symbol, price, market cap, volume, liquidity, etc.)
  - **New Launches**: Table data (symbol, name, contract, Twitter, description, launch time)
  - **Global Stats & Major Cards**: Summary stats from the homepage

- Data is extracted using DOM selectors and mapped to structured JS objects.

### 2. Data Filtering & Formatting

- **filterData.js** receives raw table data and "otherData" (stats, launches).
- It parses and normalizes values (e.g., "$1.2M" → 1200000), extracts liquidity/buy/sell info, and applies filters:
  - Minimum market cap: $100K
  - Minimum 24h volume: $1K
- The filtered and processed data is saved as `filteredDataWithOther.json`.

### 3. Real-Time Data Delivery

- **app.js** serves as the main API and Socket.IO server.
- On startup and whenever `filteredDataWithOther.json` changes, it emits the latest data to all connected clients via the `filteredDataUpdate` event.
- Static files (including a test HTML page) are served from `/public`.

### 4. Token Analytics & External Data

- **fetching.js** provides deep analytics for individual tokens:
  - Finds the best trading pair for a token using DexScreener API and a custom scoring function.
  - Fetches OHLCV candles and trading activity from GeckoTerminal.
  - Queries Bitquery for all-time and 24h trade stats.
  - Aggregates all info (price, liquidity, volume, momentum, social links, images) into a single analytics object.
- The `/api/individualTokenData` endpoint receives token data and returns the analytics object.

### 5. Process Management & Deployment

- **ecosystem.config.cjs** configures PM2 to run both the scraper and API server as separate processes.
- **Dockerfile** builds a minimal Node.js image, installs Chrome for Puppeteer, and sets up the app for production.

### 6. Continuous Deployment to Azure Container App

This project uses GitHub Actions to automate backend deployment:

- **Trigger:** On push to `master` or manual dispatch.
- **Build:** Checks out code, builds a Docker image for the backend.
- **Push:** Pushes the image to Azure Container Registry.
- **Deploy:** Deploys the new image to Azure Container Apps using environment variables from GitHub secrets.
- **Deployment Link:** https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io

## Key Files

- [`scrapeData.js`](backend/scrapeData.js): Puppeteer scraping logic.
- [`filterData.js`](backend/filterData.js): Data normalization and filtering.
- [`fetching.js`](backend/fetching.js): Token analytics, external API integration.
- [`app.js`](backend/app.js): Express server, Socket.IO, API endpoints.
- [`filteredDataWithOther.json`](backend/filteredDataWithOther.json): Main output file for frontend consumption.

---

## API Endpoints

- `GET /api/status` — Health check/status.
- `POST /api/individualTokenData` — Returns analytics for a specific token (expects `{ tokenData: { ... } }` in body).

---

## Environment Variables

- `BITQUERY_API_KEY` — Required for Bitquery analytics.
- `PORT` — Server port (default: 3000).
- `PUPPETEER_EXECUTABLE_PATH` — Chrome binary path for production Docker runs.

---

## Running Locally

1. **Install dependencies**:  
   ```
   npm install
   ```
2. **Set up `.env`** (see `.env.example`).
3. **Start with PM2**:  
   ```
   pm2 start ecosystem.config.cjs
   ```
   Or run servers individually:
   ```
   node scrapeData.js
   node app.js
   ```
4. **Access**:  
   - API: [https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io/api/status](https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io/api/status)
   - Socket.IO test: [https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io/](https://believerappbackend.yellowbeach-624b30e5.centralindia.azurecontainerapps.io/)

---

## Docker

Build and run the backend in a container:
```sh
docker build -t believescreener-backend .
docker run -p 3000:3000 --env-file .env believescreener-backend
```

---

## Notes

- The backend is designed for extensibility: add new data sources, filters, or analytics as needed.
- For production, use HTTPS and secure your API keys.
- The frontend should listen for `filteredDataUpdate` events for real-time updates.

---

# BelieveScreener frontend

---

## Data Flow & Implementation

### 1. Real-Time Data via Socket.IO

- Uses a custom [`useSocket`](hooks/useSocket.tsx) hook and context to connect to the backend Socket.IO server.
- Receives `filteredDataUpdate` events with the latest token data and stats.
- All token lists and dashboards update instantly as new data arrives.

### 2. Top Tokens & New Launches

- **Top Tokens**:  
  - [`top.tsx`](app/(tabs)/top.tsx) displays the top 75 tokens with price, market cap, liquidity, holders, and a mini chart.
  - Search and filter tokens in real-time.
  - Tapping a token navigates to its analytics page.

- **New Launches**:  
  - [`new_Launch.tsx`](app/(tabs)/new_Launch.tsx) lists the latest token launches with symbol, name, curve %, contract, Twitter, and launch time.
  - Search and filter new launches instantly.
  - Quick links to trade and social profiles.

### 3. Token Analytics Page

- [`IndividualToken.tsx`](app/IndividualToken.tsx) fetches deep analytics for a selected token via the backend API.
- Displays:
  - **Live Price Chart**: Interactive OHLCV chart with multiple timeframes (3H, 6H, 1D, 1W, etc.).
  - **Market Stats**: Market cap, volume, liquidity, 24h high/low, and momentum.
  - **Trading Activity**: Buys, sells, unique wallets, and trade history.
  - **Social Links**: Website, Twitter, and other socials.
  - **Token Info**: Contract address, chain, DEX, and more.
- Tabbed navigation for Overview, Chart, Trades, and Info.

### 4. Theming & UI

- Uses [NativeWind](https://www.nativewind.dev/) for TailwindCSS-style utility classes in React Native.
- Supports dark and light themes via a custom [`useTheme`](hooks/useTheme.tsx) context.
- Responsive layouts and smooth transitions.

---

## How It Works

1. **Socket Connection**:  
   On app start, connects to the backend Socket.IO server ([`socket.ts`](socket.ts)).  
   Receives real-time token data and updates UI instantly.

2. **Navigation**:  
   - Welcome page introduces features and CTA.
   - Tab navigation for Top Tokens and New Launches.
   - Selecting a token opens the analytics page.

3. **API Integration**:  
   - For detailed analytics, the frontend sends a POST request to `/api/individualTokenData` with the token info.
   - Receives and displays analytics, charts, and stats.

---

## Running Locally

1. **Install dependencies**: npm install

2. **Start the Expo app**: npx expo start

3. **Connect your device or use an emulator/web browser**.

---

## Environment Variables

- `.env` can be used for custom backend URLs or feature flags if needed.

---

## Customization & Extensibility

- Add new tabs, analytics, or UI components in the `app/` and `components/` folders.
- Update Tailwind styles in `tailwind.config.js` and `global.css`.
- Easily extend token analytics and UI for new data sources.

---

## Notes

- The frontend is designed for extensibility and rapid updates.
- For production, ensure secure backend URLs and API keys.
- Built by Aman Jaiswal.

For any questions, issues, or suggestions regarding BelieveScreener Clone, feel free to reach out:

- **Email:** hello@aman-jaiswal.tech
- **Twitter:** [@Aman09143227](https://x.com/Aman09143227)
- **GitHub Issues:** [Open an issue](https://github.com/JAmanOG/believe-screener/issues)

I'm happy to help with any problems or feedback!