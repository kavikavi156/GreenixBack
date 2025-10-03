#!/bin/bash

# Render Deployment Script for Greenix Backend
echo "🚀 Starting Greenix Backend Deployment to Render..."

# Verify directory structure
echo "📁 Checking directory structure..."
if [ -d "backend/server" ]; then
    echo "✅ backend/server directory found"
else
    echo "❌ backend/server directory missing!"
    exit 1
fi

if [ -f "backend/server/package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json missing in backend/server!"
    exit 1
fi

if [ -f "backend/server/index.js" ]; then
    echo "✅ index.js found"
else
    echo "❌ index.js missing in backend/server!"
    exit 1
fi

# Check for required environment variables
echo "🔧 Environment variables needed for Render:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=your_mongodb_connection_string"
echo "   - JWT_SECRET=your_jwt_secret"
echo "   - RAZORPAY_KEY_ID=your_razorpay_key"
echo "   - RAZORPAY_KEY_SECRET=your_razorpay_secret"

# Git operations
echo "📤 Preparing for deployment..."
git add .
git commit -m "Fix Render deployment configuration - correct root directory"

echo "🌐 Pushing to repository..."
git push origin main

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Select your backend service"
echo "3. Go to Settings"
echo "4. Set Root Directory: backend/server"
echo "5. Set Build Command: npm install"
echo "6. Set Start Command: npm start"
echo "7. Add environment variables"
echo "8. Click 'Deploy Latest Commit'"
echo ""
echo "🎯 Your backend should deploy successfully with root directory: backend/server"