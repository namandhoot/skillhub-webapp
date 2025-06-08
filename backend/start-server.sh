#!/bin/bash

# SkillHub Backend Startup Script
echo "🚀 Starting SkillHub Backend Server..."

# Set environment variables
export NODE_ENV=development
export PORT=5001
export MONGODB_URI=mongodb://localhost:27017/skillhub
export JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters_long

# For now, we'll set a placeholder for Gemini API key
# Replace this with your actual Google Gemini API key
export GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY:-""}

if [ -z "$GOOGLE_GEMINI_API_KEY" ]; then
    echo "⚠️  Warning: GOOGLE_GEMINI_API_KEY not set. Skills will be hardcoded."
    echo "   To use AI-generated skills, set your Gemini API key:"
    echo "   export GOOGLE_GEMINI_API_KEY='your_api_key_here'"
else
    echo "✅ Google Gemini API key is configured"
fi

# Start the server
echo "🏃 Starting server on port $PORT..."
npm start 