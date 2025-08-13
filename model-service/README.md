# Interview AI Platform Model Service

This is the AI model service for the Interview AI Platform. It provides APIs for speech recognition and text generation.

## Features

- Speech-to-text transcription using Hugging Face Whisper model
- Text generation using Google's Gemini API
- RESTful API endpoints for integration with the main application

## Deployment on Render

### Prerequisites

- A Render account
- Google Generative AI API key

### Steps to Deploy

1. Create a new Web Service on Render
2. Link to your GitHub repository
3. Configure the service:
   - **Name**: interview-ai-model-service
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter or higher

4. Add the following environment variables:
   - `GEMINI_API_KEY`: Your Google Generative AI API key
   - `ALLOWED_ORIGINS`: The URL of your frontend (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`

5. Deploy!

## API Endpoints

### Health Check
```
GET /health
```

### Generate Text
```
POST /api/generate
Body: { "prompt": "Your prompt here", "model": "gemini-pro" }
```

### Transcribe Audio
```
POST /api/transcribe
Body: { "audioData": "base64-encoded-audio" }
```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Run the server: `npm run dev`
