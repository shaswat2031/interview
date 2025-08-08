"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";

const PricingPage = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Fetch current user and plans data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch user data and current plan
        const userResponse = await fetch("/api/profile/get", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.profile);
          setCurrentPlan(userData.profile.plan);
        }

        // Fetch available plans
        const plansResponse = await fetch("/api/plans");
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          setPlans(plansData.plans || plansData || []);
        } else {
          console.error("Failed to fetch plans");
          setPlans([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlanSelection = async (planName) => {
    const token = localStorage.getItem("token");

    if (!token) {
      // If not logged in, redirect to register/login
      localStorage.setItem("selectedPlan", planName);
      window.location.href = "/register";
      return;
    }

    if (planName === currentPlan) {
      return; // Already on this plan
    }

    setIsChangingPlan(true);

    try {
      const response = await fetch("/api/users/select-plan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName,
          isUpgrade: getPlanTier(planName) > getPlanTier(currentPlan),
          currentPlan,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(planName);

        // Show success message
        alert(
          `Successfully ${
            data.isUpgrade ? "upgraded" : "changed"
          } to ${planName} plan! ${data.message}`
        );

        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        alert(`Failed to change plan: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      alert("Error changing plan. Please try again.");
    } finally {
      setIsChangingPlan(false);
    }
  };

  const getPlanTier = (planName) => {
    const tiers = { Free: 1, Starter: 2, Weekly: 3, Monthly: 4 };
    return tiers[planName] || 0;
  };

  const getButtonText = (planName) => {
    if (isChangingPlan) return "Processing...";
    if (!user) return "Get Started";
    if (currentPlan === planName) return "Current Plan";

    const currentTier = getPlanTier(currentPlan);
    const selectedTier = getPlanTier(planName);

    if (selectedTier > currentTier) return "Upgrade Now";
    if (selectedTier < currentTier) return "Downgrade";
    return "Select Plan";
  };

  const getButtonStyle = (planName) => {
    if (currentPlan === planName) {
      return "bg-gray-400 cursor-not-allowed text-white";
    }
    return "bg-blue-600 hover:bg-blue-700 text-white";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Head>
        <title>Pricing Plans - InterviewAI</title>
        <meta
          name="description"
          content="Choose the perfect plan for your interview preparation journey"
        />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">I</span>
                </div>
                <h1 className="text-xl font-bold text-blue-600">InterviewAI</h1>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {[
                  { name: "Dashboard", href: "/dashboard" },
                  { name: "Practice", href: "/practice" },
                  { name: "Analytics", href: "/analytics" },
                  { name: "Pricing", href: "/pricing", active: true },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 transition-colors duration-200 ${
                      item.active
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() =>
                      (window.location.href = "/profile-management")
                    }
                    className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <span className="text-2xl">👨‍💼</span>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-blue-600">{currentPlan} Plan</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.location.href = "/";
                    }}
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-x-4">
                  <a
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Get the right tools for your interview preparation journey
            </p>
            {user && currentPlan && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p className="text-blue-800">
                  Currently on <strong>{currentPlan}</strong> plan
                  {user.nextBillingDate && (
                    <span className="block text-sm text-blue-600">
                      Next billing:{" "}
                      {new Date(user.nextBillingDate).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans && plans.length > 0 ? (
              plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 ${
                    plan.popular
                      ? "border-blue-500 transform scale-105"
                      : currentPlan === plan.name
                      ? "border-green-500"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {currentPlan === plan.name && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Current
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {plan.price}
                      </div>
                      <p className="text-gray-500 text-sm">{plan.period}</p>
                      <p className="text-lg font-medium text-gray-700 mt-2">
                        {plan.interviews}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features &&
                        plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2 mt-1">✓</span>
                            <span className="text-gray-600 text-sm">
                              {feature}
                            </span>
                          </li>
                        ))}
                    </ul>

                    {plan.name !== "Free" && (
                      <div className="text-center mb-4">
                        <p className="text-sm text-blue-600 font-medium">
                          🎁 3-day free trial included
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handlePlanSelection(plan.name)}
                      disabled={currentPlan === plan.name || isChangingPlan}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-300 ${getButtonStyle(
                        plan.name
                      )}`}
                    >
                      {getButtonText(plan.name)}
                    </button>

                    {currentPlan === plan.name && (
                      <p className="text-center text-sm text-gray-500 mt-2">
                        You're already on this plan
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Plans Available
                </h3>
                <p className="text-gray-600">
                  We're working on setting up pricing plans. Please check back
                  later.
                </p>
              </div>
            )}
          </div>

          {/* Plan Change Information */}
          {user && (
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Plan Change Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    🔺 Upgrading Plan
                  </h4>
                  <ul className="space-y-1">
                    <li>• Changes take effect immediately</li>
                    <li>• Pro-rated billing for remaining cycle</li>
                    <li>• Additional features unlock instantly</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    🔽 Downgrading Plan
                  </h4>
                  <ul className="space-y-1">
                    <li>• Changes take effect next billing cycle</li>
                    <li>• Keep current features until cycle ends</li>
                    <li>• No immediate charges</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I change my plan anytime?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes! You can upgrade or downgrade your plan at any time.
                  Upgrades take effect immediately with pro-rated billing, while
                  downgrades take effect at your next billing cycle.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  What happens to my interview history?
                </h4>
                <p className="text-gray-600 text-sm">
                  All your interview history, scores, and progress are preserved
                  regardless of plan changes. You'll never lose your data.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  How does the free trial work?
                </h4>
                <p className="text-gray-600 text-sm">
                  All paid plans come with a 3-day free trial. No credit card
                  required during trial. Full access to plan features included.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Can I cancel anytime?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes, you can cancel your subscription at any time. You'll
                  continue to have access until the end of your current billing
                  period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
