"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SelectPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExtraInterviewModal, setShowExtraInterviewModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentStep, setPaymentStep] = useState(1); // 1: Details, 2: Processing, 3: Result
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      } else {
        // Define our custom plans according to requirements if API fails
        const customPlans = [
          {
            id: "free",
            name: "Free Plan",
            price: 0,
            description: "Get started with basic interview practice",
            features: [
              "1 Free Interview per month",
              "Basic AI feedback",
              "Text responses only",
              "Standard questions",
            ],
            maxInterviews: 1,
            isBundle: false,
          },
          {
            id: "bundle2",
            name: "Bundle of 2 Interviews",
            price: 60,
            description: "Perfect for immediate interview preparation",
            features: [
              "2 practice interviews",
              "Basic feedback reports",
              "Common interview questions",
              "Email support",
              "Valid for 3 months",
            ],
            popular: false,
            maxInterviews: 2,
            isBundle: true,
          },
          {
            id: "bundle5",
            name: "Bundle of 5 Interviews",
            price: 150,
            description: "Best value for regular interview practice",
            features: [
              "5 practice interviews",
              "Detailed feedback analysis",
              "Common interview questions",
              "Priority email support",
              "Valid for 6 months",
            ],
            popular: true,
            maxInterviews: 5,
            isBundle: true,
          },
          {
            id: "bundle8",
            name: "Bundle of 8 Interviews",
            price: 210,
            description: "Comprehensive interview preparation package",
            features: [
              "8 practice interviews",
              "Comprehensive feedback analysis",
              "Custom interview questions",
              "Advanced analytics",
              "Priority email support",
              "Valid for 12 months",
            ],
            popular: false,
            maxInterviews: 8,
            isBundle: true,
          },
        ];

        setPlans(customPlans);
      }
    } catch (err) {
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan) => {
    if (!plan) {
      setError("Please select a plan");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/users/select-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          isBundle: plan.isBundle,
          maxInterviews: plan.maxInterviews,
          currency: "INR",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage with new user data
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            plan: plan.id,
            interviewsLeft: data.user.interviewsLeft || plan.maxInterviews,
            isBundle: plan.isBundle,
            currency: "INR",
          })
        );

        // Show success message if interviews were added to existing count
        if (data.user.wasUpgraded) {
          alert(data.message);
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to select plan");
      }
    } catch (err) {
      setError("Failed to select plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurchaseExtraInterview = async () => {
    // Reset payment states
    setPaymentProcessing(true);
    setPaymentError("");
    setPaymentStep(2); // Move to processing step

    // Simulate payment processing
    setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/users/purchase-extra-interview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            price: 30,
            currency: "INR",
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Payment successful
          setPaymentSuccess(true);
          setPaymentStep(3); // Move to result step

          // After 2 seconds, close the modal and redirect
          setTimeout(() => {
            setShowExtraInterviewModal(false);
            router.push("/dashboard");
          }, 2000);
        } else {
          // Payment failed
          setPaymentError(data.error || "Failed to purchase extra interview");
          setPaymentStep(3); // Move to result step
        }
      } catch (err) {
        setPaymentError("Failed to process payment. Please try again.");
        setPaymentStep(3); // Move to result step
      } finally {
        setPaymentProcessing(false);
        setIsSubmitting(false);
      }
    }, 2000); // Simulate 2 seconds of processing time
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan to accelerate your interview preparation
            journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const displayPrice = plan.price === 0 ? "Free" : `₹${plan.price}`;
            const isSelected = selectedPlan?.name === plan.name;
            const isFree = plan.name === "Free";

            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  plan.popular
                    ? "border-indigo-500 ring-2 ring-indigo-200 md:transform md:scale-105"
                    : isSelected
                    ? "border-indigo-400"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {displayPrice}
                      </span>
                      {plan.price !== 0 && (
                        <span className="text-gray-600 ml-1">
                          {plan.isBundle ? " one-time" : "/month"}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {plan.isBundle
                        ? `${plan.maxInterviews} interviews`
                        : plan.price === 0
                        ? "1 interview/month"
                        : `${plan.maxInterviews} interviews`}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features?.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanSelect(plan);
                    }}
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                      plan.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                        : isSelected
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting
                      ? "Selecting..."
                      : isSelected
                      ? "Selected"
                      : "Select Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need help choosing? Start with the free plan and upgrade anytime.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Skip for now →
          </button>
        </div>
      </div>

      {/* Modal for purchasing extra interview */}
      {showExtraInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            {/* Modal header */}
            <h3 className="text-xl font-bold mb-4">Purchase Extra Interview</h3>

            {/* Step 1: Payment details */}
            {paymentStep === 1 && (
              <>
                <div className="mb-6">
                  <p className="mb-4">
                    You are about to purchase an additional interview for ₹30.
                    This will be added to your account immediately.
                  </p>

                  <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Extra Interview</span>
                      <span>₹30</span>
                    </div>
                    <div className="border-t border-indigo-200 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹30</span>
                    </div>
                  </div>

                  {/* Payment method selection - simplified for demo */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 flex items-center">
                      <input
                        type="radio"
                        checked
                        readOnly
                        className="h-4 w-4 text-indigo-600"
                      />
                      <span className="ml-2">Credit/Debit Card (Demo)</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowExtraInterviewModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchaseExtraInterview}
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Pay ₹30
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Processing payment */}
            {paymentStep === 2 && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your payment...</p>
                <p className="text-gray-500 text-sm mt-2">
                  This will only take a moment.
                </p>
              </div>
            )}

            {/* Step 3: Result */}
            {paymentStep === 3 && (
              <div className="text-center py-6">
                {paymentSuccess ? (
                  <>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Payment Successful!
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Your extra interview has been added to your account.
                    </p>
                    <p className="text-gray-500 text-sm">
                      Redirecting to dashboard...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Payment Failed
                    </h3>
                    <p className="text-red-600 mb-6">{paymentError}</p>
                    <button
                      onClick={() => setPaymentStep(1)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectPlanPage;
