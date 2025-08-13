"use client";

import React, { useState, useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripePromise } from "../lib/stripe";

// The actual payment form component
const CheckoutForm = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  metadata = {},
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.");
        onPaymentError(error);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentIntent);
      } else {
        setErrorMessage("Payment status unknown. Please contact support.");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      onPaymentError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <PaymentElement className="mb-6" />

      {errorMessage && (
        <div className="bg-red-50 p-3 rounded-lg mb-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full px-4 py-3 text-white bg-indigo-600 rounded-lg ${
          !stripe || isLoading
            ? "opacity-70 cursor-not-allowed"
            : "hover:bg-indigo-700"
        }`}
      >
        {isLoading ? "Processing..." : `Pay ₹${amount}`}
      </button>
    </form>
  );
};

// The wrapper component that loads Stripe Elements
const StripePaymentForm = ({
  amount,
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
  metadata = {},
}) => {
  const stripePromise = getStripePromise();

  if (!clientSecret) {
    return <div>Loading payment form...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        metadata={metadata}
      />
    </Elements>
  );
};

export default StripePaymentForm;
