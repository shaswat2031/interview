# Interview AI Platform - Deployment Guide

This guide explains how to deploy the Interview AI Platform with the frontend on Vercel and the model service on Render.

## Architecture

The application is split into two parts:
1. **Frontend**: A Next.js application deployed on Vercel
2. **Model Service**: A Node.js API service deployed on Render that handles AI model inference

## Deploying the Frontend on Vercel

### Prerequisites
- A Vercel account
- MongoDB database
- Stripe account (if using payment features)

### Steps

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret for JWT authentication
   - `NEXTAUTH_SECRET`: Secret for NextAuth
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `NEXT_PUBLIC_MODEL_SERVICE_URL`: URL of your model service on Render

4. Deploy!

## Deploying the Model Service on Render

See the README.md in the `model-service` directory for detailed instructions.

## Connecting the Services

1. After deploying the model service on Render, copy its URL
2. Add this URL as the `NEXT_PUBLIC_MODEL_SERVICE_URL` environment variable in your Vercel project
3. Update the `ALLOWED_ORIGINS` environment variable in your Render project to include your Vercel app URL

## Local Development

To run both services locally:

1. Start the model service:
   ```
   cd model-service
   npm install
   npm run dev
   ```

2. Start the frontend:
   ```
   npm install
   npm run dev
   ```

3. Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_MODEL_SERVICE_URL=http://localhost:3001
   ```
