#!/bin/bash

# KLPoster Production Deployment Script
# This script helps to deploy the backend to production

echo "Starting KLPoster backend deployment..."

# Check if running on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  echo "Windows environment detected. You might need Visual Studio build tools."
  echo "Make sure you have installed Visual Studio 2022 Build Tools with C++ desktop development workload."
fi

# Ensure environment variables
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create a .env file with the correct production settings."
  echo "You can use .env.example as a template."
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Run database migrations
echo "Running database migrations..."
NODE_ENV=production npm run db:migrate

# Start the application
echo "Starting application with PM2..."
if command -v pm2 &> /dev/null; then
  pm2 delete klposter 2>/dev/null || true
  pm2 start dist/index.js --name klposter --env production
  pm2 save
  echo "Application running with PM2."
  echo "Monitor with: pm2 logs klposter"
else
  echo "PM2 not found. Please install PM2 with: npm install -g pm2"
  echo "Then run: pm2 start dist/index.js --name klposter --env production"
  exit 1
fi

echo "Deployment complete! KLPoster backend is now running."
echo "To check status: pm2 status"
echo "To view logs: pm2 logs klposter" 