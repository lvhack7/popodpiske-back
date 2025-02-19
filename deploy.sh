#!/bin/bash

echo "Pulling latest changes from Git..."
git pull

echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

echo "Reloading PM2 process..."
pm2 reload server  # or pm2 reload <your_pm2_app_name>

echo "Done!"