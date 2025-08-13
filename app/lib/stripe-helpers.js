import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Initialize server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", // Use the latest API version
});

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
