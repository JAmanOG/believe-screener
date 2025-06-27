# FROM ghcr.io/puppeteer/puppeteer:24.11.0
FROM node:22-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y wget gnupg ca-certificates && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/google-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && apt-get install -y google-chrome-stable

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set working dir
WORKDIR /app

# Copy files and install deps
COPY package*.json ./
RUN npm install
RUN npm install -g pm2
COPY . .

# Expose and run
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.cjs"]
