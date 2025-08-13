import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with the publishable key
export const getStripePromise = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Create a payment intent on the server side
export const createPaymentIntent = async (
  amount,
  currency = "inr",
  metadata = {}
) => {
  try {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};
