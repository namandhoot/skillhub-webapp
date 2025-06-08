# API Key Troubleshooting Guide

## Current Status ✅

Your SkillHub application is **working correctly** with the following features:

- ✅ **Backend Server**: Running on port 5001
- ✅ **Learning Resources**: Fetching Coursera courses for skills
- ✅ **Skills Generation**: Providing relevant skills for roles (using fallback)
- ✅ **Frontend**: Should now display resources properly

## API Key Issues ⚠️

The provided API keys are encountering authentication issues:

### YouTube API Key
**Error**: "API Key not found. Please pass a valid API key."

**Possible Solutions**:
1. **Enable YouTube Data API v3** in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

2. **Check API Key Restrictions**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"
   - Click on your API key
   - Ensure "YouTube Data API v3" is in the list of APIs this key can access

### Gemini API Key
**Error**: "API Key not found. Please pass a valid API key."

**Possible Solutions**:
1. **Use Google AI Studio Key** (Recommended):
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key specifically for Gemini
   - This is different from Google Cloud Console keys

2. **Check Key Format**:
   - Gemini keys usually start with `AIza...` (which yours does)
   - Make sure there are no extra spaces or characters

## Testing API Keys

### Test YouTube API Key
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=test&key=YOUR_YOUTUBE_API_KEY"
```

### Test Gemini API Key
```bash
curl -H "Content-Type: application/json" \
-d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_API_KEY"
```

## What's Working Now

Even without the API keys, your application provides:

### Learning Resources
- **Coursera Courses**: Relevant programming courses for each skill
- **Platform Badges**: Visual indicators for different learning platforms  
- **Resource Metadata**: Quality scores, relevance ratings, descriptions

### Skills Generation
- **Role-Specific Skills**: Curated skills for different tech roles
- **Skill Details**: Importance levels, learning time estimates, descriptions
- **Fallback Skills**: Comprehensive list for common roles like:
  - Frontend Developer
  - Backend Developer
  - Data Scientist
  - DevOps Engineer
  - Full Stack Developer

## Next Steps

1. **For YouTube Resources**: 
   - Get a valid YouTube Data API v3 key from Google Cloud Console
   - Enable the YouTube Data API v3 service
   - Replace the current key

2. **For AI-Generated Skills**:
   - Get a valid Gemini API key from Google AI Studio
   - Replace the current key
   - This will enable role-specific, AI-generated skills instead of fallback ones

3. **For Now**: 
   - Your application is fully functional with fallback data
   - Users can browse skills, get learning resources, and perform skill gap analysis
   - The frontend should display resources correctly

## Environment Variables

The server is currently running with:
```bash
GOOGLE_GEMINI_API_KEY="AIzaSyAFl-pSj0jNBmowYw3KEwO3oboSV9avx-o"
YOUTUBE_API_KEY="AIzaSyAFl-pSj0jNBmowYw3KEwO3oboSV9avx-o"
PORT=5001
```

When you get valid keys, restart the server with:
```bash
export GOOGLE_GEMINI_API_KEY="your_valid_gemini_key"
export YOUTUBE_API_KEY="your_valid_youtube_key"
export PORT=5001
node server.js
``` 