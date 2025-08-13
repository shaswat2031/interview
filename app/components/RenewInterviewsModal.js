"use client";

import React, { useState, useEffect } from "react";

const RenewInterviewsModal = ({
  isOpen,
  onClose,
  currentPlan,
  onRenew,
  hasInterviewsLeft = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [useDiscount, setUseDiscount] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Options, 2: Processing, 3: Result
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [availableBundles, setAvailableBundles] = useState([]);
  const [showBundleOptions, setShowBundleOptions] = useState(false);
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);

  useEffect(() => {
    // Fetch available bundles when modal opens
    if (isOpen) {
      fetchBundles();
    }
  }, [isOpen]);

  const fetchBundles = async () => {
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const data = await response.json();
        // Filter only bundle plans
        const bundles = data.plans.filter((plan) => plan.isBundle);
        setAvailableBundles(bundles);
      }
    } catch (error) {
      console.error("Error fetching bundles:", error);
    }
  };

  // Calculate renewal price based on plan type
  const getRenewalDetails = () => {
    // If a new bundle is selected, use that for pricing
    const planToUse = selectedBundle || currentPlan;

    let basePrice = 0;
    let renewalInterviews = 0;
    let discountPercentage = hasInterviewsLeft ? 15 : 0; // 15% discount for early renewal

    if (!planToUse)
      return {
        basePrice,
        finalPrice: basePrice,
        renewalInterviews,
        discountAmount: 0,
      };

    if (planToUse.isBundle) {
      // For bundle plans
      basePrice = selectedBundle
        ? planToUse.price
        : Math.round(planToUse.price * 0.8); // Full price for new bundle, 20% off for renewal
      renewalInterviews = planToUse.maxInterviews;
    } else if (planToUse.id === "free") {
      // For free plan
      basePrice = 30;
      renewalInterviews = 1;
      discountPercentage = 0; // No discount for free plan
    } else {
      // For subscription plans
      basePrice = planToUse.price;
      renewalInterviews = planToUse.maxInterviews;
    }

    const discountAmount =
      useDiscount && discountPercentage > 0 && !selectedBundle // No discount when changing bundles
        ? Math.round(basePrice * (discountPercentage / 100))
        : 0;

    const finalPrice = basePrice - discountAmount;

    return {
      basePrice,
      finalPrice,
      renewalInterviews,
      discountAmount,
      discountPercentage,
      planName: planToUse.name,
    };
  };

  const {
    basePrice,
    finalPrice,
    renewalInterviews,
    discountAmount,
    discountPercentage,
    planName,
  } = getRenewalDetails();

  const handleRenew = async () => {
    setIsSubmitting(true);
    setError("");
    setPaymentStep(2); // Processing
    console.log("Starting payment process...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You need to log in again.");
        setPaymentStep(3);
        console.error("No auth token found");
        return;
      }

      // Prepare payment data
      const { finalPrice } = getRenewalDetails();
      const isRenewal = !selectedBundle;
      const planId = selectedBundle ? selectedBundle.id : currentPlan?.id;

      console.log("Payment details:", {
        planId,
        isRenewal,
        finalPrice,
        currentPlan: currentPlan?.name,
        selectedBundle: selectedBundle?.name,
      });

      // Additional metadata for payment
      const metadata = {
        useDiscount: (
          useDiscount &&
          hasInterviewsLeft &&
          !selectedBundle
        ).toString(),
        interviewCount: selectedBundle
          ? selectedBundle.maxInterviews.toString()
          : currentPlan?.maxInterviews.toString(),
        planName: selectedBundle ? selectedBundle.name : currentPlan?.name,
        isBundle:
          selectedBundle || (currentPlan && currentPlan.isBundle)
            ? "true"
            : "false",
      };

      // Check if we should use test mode
      const useTestMode = localStorage.getItem("useTestMode") === "true";
      const endpoint = useTestMode
        ? "/api/mock-payment"
        : "/api/checkout/session";

      console.log(`Sending request to ${endpoint} (Test mode: ${useTestMode})`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          isRenewal,
          customAmount: finalPrice,
          metadata,
        }),
      });
      if (!response.ok) {
        console.error("HTTP error:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Response text:", errorText);
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Checkout session response:", data);

      if (data.url) {
        // Redirect to Stripe Checkout
        console.log("Redirecting to Stripe Checkout:", data.url);
        setRedirectingToCheckout(true);
        window.location.href = data.url;
      } else {
        console.error("No URL in checkout response:", data);
        setError("Failed to create checkout session. Please try again.");
        setPaymentStep(3); // Error
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("Failed to process payment. Please try again.");
      setPaymentStep(3); // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {paymentStep === 1 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedBundle ? "Purchase New Bundle" : "Renew Interviews"}
            </h2>

            <div className="mb-6">
              {/* Purchase options */}
              <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => {
                      setSelectedBundle(null);
                      setShowBundleOptions(false);
                    }}
                    className={`py-2 px-4 rounded-lg ${
                      !showBundleOptions
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Renew Current Plan
                  </button>
                  <button
                    onClick={() => setShowBundleOptions(true)}
                    className={`py-2 px-4 rounded-lg ${
                      showBundleOptions
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Buy New Bundle
                  </button>
                </div>

                {showBundleOptions && (
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {availableBundles.map((bundle) => (
                      <div
                        key={bundle.id}
                        onClick={() => setSelectedBundle(bundle)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedBundle?.id === bundle.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <div className="font-medium">{bundle.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {bundle.maxInterviews} interviews · ₹{bundle.price}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-blue-800 mb-2">
                  {selectedBundle ? "Bundle Details" : "Renewal Details"}
                </h3>
                <p className="text-blue-700 mb-1">
                  Plan:{" "}
                  <span className="font-medium">
                    {selectedBundle?.name || currentPlan?.name || "Unknown"}
                  </span>
                </p>
                <p className="text-blue-700 mb-1">
                  Interviews:{" "}
                  <span className="font-medium">{renewalInterviews}</span>
                </p>
                <p className="text-blue-700">
                  Price: <span className="font-medium">₹{basePrice}</span>
                </p>
              </div>

              {hasInterviewsLeft && (
                <div className="flex items-start mb-4">
                  <input
                    type="checkbox"
                    id="useDiscount"
                    checked={useDiscount}
                    onChange={() => setUseDiscount(!useDiscount)}
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="useDiscount" className="text-sm">
                    <span className="font-medium">
                      Apply Early Renewal Discount ({discountPercentage}%)
                    </span>
                    <p className="text-gray-600 text-xs mt-1">
                      You still have interviews left. Renewing now gives you a{" "}
                      {discountPercentage}% discount!
                    </p>
                  </label>
                </div>
              )}

              {useDiscount && discountAmount > 0 && (
                <div className="bg-green-50 p-3 rounded-lg mb-4 text-sm">
                  <p className="text-green-700">
                    Discount:{" "}
                    <span className="font-medium">-₹{discountAmount}</span>
                  </p>
                  <p className="text-green-700 font-medium">
                    Final Price: ₹{finalPrice}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-lg mb-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRenew}
                disabled={
                  isSubmitting || (showBundleOptions && !selectedBundle)
                }
                className={`px-4 py-2 text-white rounded-lg ${
                  showBundleOptions && !selectedBundle
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {selectedBundle ? "Purchase Now" : "Renew Now"}
              </button>
            </div>
          </>
        )}

        {paymentStep === 2 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-700">
              {redirectingToCheckout
                ? "Redirecting to secure payment page..."
                : "Processing payment request..."}
            </p>
            {redirectingToCheckout && (
              <p className="text-sm text-gray-500 mt-2">
                You'll be redirected to Stripe to complete your payment
                securely.
              </p>
            )}
          </div>
        )}

        {paymentStep === 3 && (
          <div className="text-center py-8">
            {paymentSuccess ? (
              <>
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedBundle
                    ? `You've successfully purchased the ${planName}. Your interviews have been added to your existing count.`
                    : `Your interviews have been renewed. You now have ${renewalInterviews} more interviews.`}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <div className="text-red-500 text-5xl mb-4">✗</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Payment Failed
                </h3>
                <p className="text-gray-600 mb-2">
                  {error || "There was an issue processing your payment."}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Please try again or contact support if the issue persists.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setPaymentStep(1)}
                    className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewInterviewsModal;
