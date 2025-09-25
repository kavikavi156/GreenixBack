#!/bin/bash
# Render.com startup script for Greenix backend

echo "Starting Greenix Backend Server..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Navigate to backend server directory
cd backend/server

echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in backend/server directory"
    exit 1
fi

# Check if index.js exists
if [ ! -f "index.js" ]; then
    echo "Error: index.js not found in backend/server directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
echo "Starting server with: node index.js"
exec node index.js
