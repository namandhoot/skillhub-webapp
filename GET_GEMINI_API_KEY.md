# How to Get Google Gemini API Key

To enable AI-powered skills generation in SkillHub, you need to get a Google Gemini API key. Here's how:

## Step 1: Go to Google AI Studio

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account

## Step 2: Create a New API Key

1. Click on "Get API key" button
2. Select "Create API key in new project" or choose an existing project
3. Your API key will be generated

## Step 3: Copy the API Key

1. Copy the generated API key (it starts with something like `AIza...`)
2. Keep this key secure and don't share it publicly

## Step 4: Set the Environment Variable

### Option A: Set it in your terminal session (temporary)
```bash
export GOOGLE_GEMINI_API_KEY="AIza_your_actual_api_key_here"
```

### Option B: Create a .env file (permanent)
1. In the `backend` directory, create a file named `.env`
2. Add this line to the file:
```
GOOGLE_GEMINI_API_KEY=AIza_your_actual_api_key_here
```

### Option C: Set it in your shell profile (permanent)
Add to your `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`:
```bash
export GOOGLE_GEMINI_API_KEY="AIza_your_actual_api_key_here"
```

## Step 5: Restart the Server

After setting the API key, restart the backend server:

```bash
cd backend
PORT=5001 npm start
```

## How to Verify It's Working

1. Check the server logs for this message: `✅ Gemini API initialized successfully`
2. Test the skills generation endpoint:
```bash
curl "http://localhost:5001/api/users/public/required-skills/Data%20Scientist"
```

If working correctly, you should see AI-generated skills specific to the role instead of generic fallback skills.

## Troubleshooting

- **"Invalid API key" error**: Make sure you copied the key correctly
- **"API key not set" warning**: The environment variable isn't set properly
- **Still getting fallback skills**: The API key might be invalid or there's a network issue

## Important Notes

- The API key is free but has usage limits
- Don't commit the `.env` file to version control
- Keep your API key secure and rotate it if compromised 