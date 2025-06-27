module.exports= {
  apps: [
    {
      name: "scraper",
      script: "./scrapeData.js",
      watch: false,
      restart_delay: 1000,
    },
    {
      name: "api-server",
      script: "./app.js",
      watch: false,
      restart_delay: 1000, 
    },
  ],
};
