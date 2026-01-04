#!/bin/bash

# XZone News Map Chart - Quick Start Script
# This script automates the setup process

set -e

echo "🚀 XZone News Map Chart - Quick Start"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js version $NODE_VERSION is too old"
    echo "Please upgrade to Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: You need to add your Gemini API key!"
    echo ""
    echo "1. Get your API key from: https://aistudio.google.com/app/apikey"
    echo "2. Open .env file and paste your API key"
    echo "3. Run this script again"
    echo ""

    # Check if EDITOR is set
    if [ -n "$EDITOR" ]; then
        read -p "Open .env in editor now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $EDITOR .env
        fi
    else
        echo "Or edit manually: nano .env"
    fi

    exit 0
fi

# Check if API key is set
if grep -q "VITE_GEMINI_API_KEY=$" .env || grep -q "VITE_GEMINI_API_KEY=your_api_key_here" .env; then
    echo "⚠️  API key not set in .env file"
    echo ""
    echo "Please edit .env and add your Gemini API key:"
    echo "  VITE_GEMINI_API_KEY=your_actual_key_here"
    echo ""
    echo "Get your key from: https://aistudio.google.com/app/apikey"
    exit 1
fi

echo "✅ API key found in .env"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Check if user wants to run dev server
echo "🎯 Ready to start!"
echo ""
read -p "Start development server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting development server..."
    echo "   App will be available at: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo ""
    echo "To start the server manually, run:"
    echo "  npm run dev"
    echo ""
    echo "To build for production, run:"
    echo "  npm run build"
    echo ""
fi
