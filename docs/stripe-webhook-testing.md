# Setting Up Stripe Webhook Testing with Stripe CLI

This guide will help you test Stripe webhooks locally using the Stripe CLI.

## Prerequisites

1. You need to have the Stripe CLI installed on your machine
2. You need a Stripe account

## Installation

### For Windows:

1. Download the Stripe CLI from the [official GitHub repository](https://github.com/stripe/stripe-cli/releases/latest)
2. Extract the ZIP file and move `stripe.exe` to a location in your PATH

### For macOS:

```bash
brew install stripe/stripe-cli/stripe
```

### For Linux:

Download the appropriate package from the [GitHub releases page](https://github.com/stripe/stripe-cli/releases/latest).

## Setting Up Local Webhook Testing

1. **Login to your Stripe account via CLI:**

```bash
stripe login
```

This will open a browser window where you'll authorize the CLI to access your Stripe account. After authorization, the CLI will receive a webhook signing secret that it will use to send webhooks to your application.

2. **Forward events to your local application:**

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

This will start forwarding Stripe events to your local application. The CLI will display a webhook signing secret that you should copy.

3. **Update your .env.local file with the webhook signing secret:**

```
STRIPE_CLI_WEBHOOK_SECRET=whsec_your_cli_webhook_secret_here
```

Replace `whsec_your_cli_webhook_secret_here` with the webhook signing secret displayed by the Stripe CLI.

## Testing Webhooks

To test specific webhook events, you can use the `stripe trigger` command. For example:

```bash
stripe trigger payment_intent.succeeded
```

Other useful events to test:

```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
```

## Viewing Webhook Events

1. Keep an eye on your application logs to see incoming webhook events
2. You can also use the Stripe dashboard to view webhook events
3. The Stripe CLI will show events as they are forwarded to your application

## Troubleshooting

If you encounter issues:

1. Make sure your application is running locally
2. Check that the webhook endpoint URL is correct
3. Verify that the webhook signing secret is correctly set in your .env.local file
4. Look for error messages in both your application logs and the Stripe CLI output

## Additional Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Testing Webhooks with the Stripe CLI](https://stripe.com/docs/webhooks/test)
