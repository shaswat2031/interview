import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Initialize server-side Stripe instance
let stripe;

// Check if Stripe secret key is available
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16", // Use the latest API version
  });
} else {
  console.warn(
    "STRIPE_SECRET_KEY is not defined. Stripe functionality will be limited."
  );
  // Create a mock Stripe object that will throw a more helpful error when used
  stripe = new Proxy(
    {},
    {
      get: function (target, prop) {
        if (prop === "paymentIntents") {
          return {
            list: () => {
              throw new Error(
                "Stripe is not configured. Please provide STRIPE_SECRET_KEY."
              );
            },
          };
        }
        return function () {
          throw new Error(
            "Stripe is not configured. Please provide STRIPE_SECRET_KEY."
          );
        };
      },
    }
  );
}

export { stripe };

// Load Stripe.js on the client side
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Format price for display (converts cents to dollars/rupees)
export const formatAmountForDisplay = (amount, currency = "inr") => {
  const numberFormat = new Intl.NumberFormat(["en-IN"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  });
  return numberFormat.format(amount);
};

// Format price for Stripe (converts dollars/rupees to cents)
export const formatAmountForStripe = (amount, currency = "inr") => {
  const numberFormat = new Intl.NumberFormat(["en-IN"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  });
  return Math.round(amount * 100);
};
