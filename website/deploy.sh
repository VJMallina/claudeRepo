#!/bin/bash

# PiggySave Website - Netlify Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🐷 PiggySave Website Deployment to Netlify"
echo "=========================================="
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
    echo "✅ Netlify CLI installed successfully!"
else
    echo "✅ Netlify CLI is already installed"
fi

echo ""
echo "Netlify CLI version:"
netlify --version

echo ""
echo "📍 Current directory: $(pwd)"
echo ""

# Check if user is logged in
echo "Checking authentication status..."
if netlify status &> /dev/null; then
    echo "✅ Already authenticated with Netlify"
else
    echo "🔑 You need to authenticate with Netlify"
    echo ""
    echo "This will open your browser for authentication."
    echo "If you don't have a Netlify account, you can create one for free."
    echo ""
    read -p "Press Enter to continue with authentication..."

    netlify login

    if [ $? -eq 0 ]; then
        echo "✅ Authentication successful!"
    else
        echo "❌ Authentication failed. Please try again."
        exit 1
    fi
fi

echo ""
echo "Choose deployment type:"
echo "1) Draft deployment (preview URL)"
echo "2) Production deployment (live site)"
echo ""
read -p "Enter your choice (1 or 2): " choice

echo ""

case $choice in
    1)
        echo "🚀 Starting draft deployment..."
        netlify deploy
        ;;
    2)
        echo "🚀 Starting production deployment..."
        netlify deploy --prod
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Your PiggySave website is now live!"
echo ""
echo "Useful commands:"
echo "  netlify open:site    - Open your site in browser"
echo "  netlify status       - Check deployment status"
echo "  netlify logs         - View deployment logs"
echo ""
echo "To deploy again: ./deploy.sh or 'netlify deploy --prod'"
echo ""
