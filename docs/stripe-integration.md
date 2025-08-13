# Stripe Integration for Interview AI Platform

This directory contains the Stripe integration for the Interview AI Platform, enabling secure payment processing for interview bundles and subscriptions.

## Overview

The Stripe integration handles:

1. One-time payments for interview bundles
2. Processing renewals and upgrades
3. Tracking payment history
4. Managing user interview credits

## Files and Components

### API Routes

- `app/api/checkout/session/route.js` - Creates Stripe checkout sessions
- `app/api/payment-success/verify/route.js` - Verifies successful payments
- `app/api/webhooks/stripe/route.js` - Handles Stripe webhook events
- `app/api/admin/transactions/route.js` - Admin endpoint for viewing transactions

### Client Components

- `app/components/RenewInterviewsModal.js` - UI for purchasing and renewing interviews
- `app/payment-success/page.js` - Success page after payment completion
- `app/admin/payments/page.js` - Admin interface for viewing transactions

### Helper Files

- `app/lib/stripe-helpers.js` - Utility functions for Stripe integration
- `middleware.js` - Handles CORS for Stripe webhooks

### Documentation

- `docs/stripe-webhook-testing.md` - Guide for testing webhooks locally
- `docs/stripe-production-guide.md` - Guide for setting up Stripe in production

### Scripts

- `scripts/stripe-listen.bat` - Helper script for local webhook testing
- `scripts/stripe-trigger.bat` - Helper script for triggering test events

## Getting Started

1. Set up your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STRIPE_CLI_WEBHOOK_SECRET=whsec_your_cli_webhook_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. Install the Stripe CLI for local testing (see `docs/stripe-webhook-testing.md`)

3. Start your application:
   ```
   npm run dev
   ```

4. In a separate terminal, start the Stripe webhook listener:
   ```
   scripts/stripe-listen.bat
   ```

## Testing

1. Use Stripe's test card numbers for testing:
   - `4242 4242 4242 4242` - Successful payment
   - `4000 0000 0000 0002` - Failed payment
   - `4000 0025 0000 3155` - Requires authentication

2. Trigger test webhook events:
   ```
   scripts/stripe-trigger.bat
   ```

## Deployment

For production deployment, see `docs/stripe-production-guide.md`.

## Support

For issues with the Stripe integration, consult the following resources:

1. [Stripe Documentation](https://stripe.com/docs)
2. [Stripe Dashboard](https://dashboard.stripe.com)
3. Check application logs for webhook events and errors
