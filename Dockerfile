# Use official Node.js image as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files first to leverage Docker cache
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies for root, client, and server
# We use npm ci for deterministic builds if package-lock.json exists, but here we'll use install for flexibility if logs are missing
RUN npm install
RUN npm install --prefix client
RUN npm install --prefix server

# Copy the rest of the application code
COPY . .

# Build the React client
RUN npm run build --prefix client

# Expose the port the app runs on
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the server (run migrations first)
CMD ["sh", "-c", "cd server && npx sequelize-cli db:migrate --env production && node server.js"]
