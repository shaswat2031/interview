"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// Loading component for Suspense fallback
function PaymentPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    </div>
  );
}

// SVG components to reduce duplication
const CheckmarkIcon = () => (
  <svg
    className="h-10 w-10 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const CrossIcon = () => (
  <svg
    className="h-10 w-10 text-red-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// The actual payment success content
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState("loading");
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (paymentIntent && redirectStatus === "succeeded") {
      setPaymentStatus("success");

      // Fetch payment details if needed
      const fetchPaymentDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          const response = await fetch(
            `/api/verify-payment?paymentIntent=${paymentIntent}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setPaymentDetails(data);
          }
        } catch (error) {
          console.error("Error fetching payment details:", error);
        }
      };

      fetchPaymentDetails();
    } else if (redirectStatus === "failed") {
      setPaymentStatus("failed");
    }
  }, [searchParams]);

  // Redirect to dashboard after 5 seconds on success
  useEffect(() => {
    let timer;
    if (paymentStatus === "success") {
      timer = setTimeout(() => {
        router.push("/dashboard");
      }, 5000);
    }
    return () => timer && clearTimeout(timer);
  }, [paymentStatus, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        {paymentStatus === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckmarkIcon />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. You will be redirected to your
              dashboard in a few seconds.
            </p>
            {paymentDetails && (
              <div className="bg-indigo-50 p-4 rounded-lg mb-4 text-left">
                <h3 className="font-medium text-indigo-800 mb-2">
                  Payment Details
                </h3>
                <p className="text-indigo-700 mb-1">
                  Plan:{" "}
                  <span className="font-medium">{paymentDetails.planName}</span>
                </p>
                <p className="text-indigo-700 mb-1">
                  Amount:{" "}
                  <span className="font-medium">₹{paymentDetails.amount}</span>
                </p>
                <p className="text-indigo-700">
                  Interviews:{" "}
                  <span className="font-medium">
                    {paymentDetails.interviews}
                  </span>
                </p>
              </div>
            )}
            <Link href="/dashboard">
              <button className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Go to Dashboard
              </button>
            </Link>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CrossIcon />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              There was an issue processing your payment. Please try again.
            </p>
            <Link href="/interview-setup">
              <button className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Try Again
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={<PaymentPageLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;
