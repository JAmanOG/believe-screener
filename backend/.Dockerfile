# FROM node:22-slim
FROM ghcr.io/puppeteer/puppeteer:24.11.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
# Set the working directory
WORKDIR /app


# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Install pm2 globally
RUN npm install -g pm2

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application using pm2
CMD ["pm2-runtime", "ecosystem.config.cjs"]
