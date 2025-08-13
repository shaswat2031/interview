@echo off
echo Starting Stripe webhook listener...
echo.
echo Make sure your Next.js application is running!
echo.
echo This script will forward Stripe webhook events to your local application.
echo Copy the webhook signing secret and add it to your .env.local file as STRIPE_CLI_WEBHOOK_SECRET
echo.
echo Press Ctrl+C to stop the listener
echo.

stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
