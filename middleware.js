import { NextResponse } from "next/server";

// Middleware for handling Stripe webhook requests
export function middleware(request) {
  // For Stripe webhook requests
  if (request.nextUrl.pathname === "/api/webhooks/stripe") {
    // Allow any origin for Stripe webhook requests
    return NextResponse.next({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
      },
    });
  }

  // For all other requests, continue as normal
  return NextResponse.next();
}

// Configure the middleware to run only for API routes
export const config = {
  matcher: "/api/:path*",
};
