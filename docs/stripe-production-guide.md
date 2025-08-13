# Stripe Integration Guide for Production

This guide will help you set up Stripe in a production environment for your application.

## Prerequisites

1. A Stripe account
2. Your application deployed to a production environment with HTTPS

## Setting Up Stripe in Production

### 1. Create a Stripe Account

If you haven't already, create a Stripe account at [stripe.com](https://stripe.com).

### 2. Configure Your Stripe Dashboard

1. Set up your business information
2. Configure payment methods you want to accept
3. Set up your branding in the Stripe Dashboard

### 3. Update Environment Variables

Update your production environment variables with your live Stripe API keys:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**IMPORTANT**: Never expose your secret key in client-side code.

### 4. Set Up Webhooks

1. Go to the Webhooks section in your Stripe Dashboard
2. Click "Add endpoint"
3. Enter your webhook URL (e.g., `https://your-domain.com/api/webhooks/stripe`)
4. Select the events you want to receive (at minimum: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`)
5. Copy the signing secret and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Testing in Production

Before going live, test your integration using Stripe's test mode:

1. Make sure you're using test API keys
2. Use Stripe's test cards to simulate payments:
   - `4242 4242 4242 4242` - Successful payment
   - `4000 0000 0000 0002` - Failed payment
   - `4000 0025 0000 3155` - Requires authentication

### 6. Going Live

When you're ready to accept real payments:

1. Switch to your live API keys
2. Update your webhook endpoint to use the live webhook signing secret
3. Make a test purchase with a real card to ensure everything works correctly

## Best Practices for Production

### Security

1. Always use HTTPS for all pages that handle payment information
2. Keep your Stripe secret key secure and never expose it in client-side code
3. Validate all webhook requests with the webhook signing secret
4. Implement proper authentication for your payment endpoints

### Error Handling

1. Implement robust error handling for payment failures
2. Log all payment events for auditing and debugging
3. Set up monitoring for your webhook endpoint
4. Implement retry logic for failed webhook deliveries

### User Experience

1. Provide clear feedback to users during the payment process
2. Display appropriate error messages when payments fail
3. Send email confirmations for successful payments
4. Provide a way for users to view their payment history

### Compliance

1. Ensure your terms of service and privacy policy are up to date
2. Implement appropriate refund policies
3. Comply with tax regulations in your jurisdiction
4. Consider implementing Stripe Tax for automatic tax calculation

## Troubleshooting

### Common Issues

1. **Webhook Errors**: Check that your webhook endpoint is accessible and that you're using the correct signing secret
2. **Payment Failures**: Check the error message in the Stripe Dashboard for more information
3. **API Key Issues**: Ensure you're using the correct API keys for your environment

### Stripe Logs

The Stripe Dashboard provides detailed logs for:

1. Payments
2. Webhooks
3. API requests

Use these logs to debug issues with your integration.

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
