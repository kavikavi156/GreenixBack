#!/bin/bash

echo "Building Greenix Application..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install root dependencies (minimal)
echo "Installing root dependencies..."
npm install --production

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend/server
if [ -f "package.json" ]; then
    npm install --production
    echo "Backend dependencies installed successfully"
else
    echo "Error: backend/server/package.json not found"
    exit 1
fi

echo "Build completed successfully!"