import { NextResponse } from "next/server";

// This endpoint provides debug information about the environment
export async function GET(request) {
  try {
    // Get basic environment variables (excluding sensitive data)
    const debugInfo = {
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      nodeEnv: process.env.NODE_ENV,
      hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasStripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasCliWebhookSecret: !!process.env.STRIPE_CLI_WEBHOOK_SECRET,
      serverTime: new Date().toISOString(),
    };

    return NextResponse.json({
      status: "success",
      data: debugInfo,
    });
  } catch (error) {
    console.error("Debug info error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
