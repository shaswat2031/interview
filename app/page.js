"use client";

import React, { useState } from "react";
import Head from "next/head";

const Page = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add login state

  // Simulate login check - in real app, this would come from auth context
  // setIsLoggedIn(true); // You can toggle this to test

  // Function to handle login (for testing purposes)
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // User profile data (in real app, this would come from API/database)
  const userProfile = {
    name: "Prasad Shaswat",
    plan: "Starter Plan",
    avatar: "👨‍💼",
    email: "prasadshaswat9265@gmail.com",
    interviewsCompleted: 3,
    interviewsRemaining: 2,
    memberSince: "January 2025",
  };

  // Save profile function
  const saveProfileData = async () => {
    try {
      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userProfile),
      });

      if (response.ok) {
        alert("✅ Profile saved successfully!");
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("❌ Error saving profile. Please try again.");
    }
  };

  const features = [
    {
      title: "AI-Powered Interviews",
      description:
        "Practice with our advanced AI that simulates real interview scenarios across various industries.",
      icon: "🤖",
    },
    {
      title: "Real-Time Feedback",
      description:
        "Get instant analysis of your responses, body language, and communication skills.",
      icon: "📊",
    },
    {
      title: "Personalized Coaching",
      description:
        "Receive tailored advice to improve your weaknesses and highlight your strengths.",
      icon: "🎯",
    },
    {
      title: "Industry-Specific Prep",
      description:
        "Specialized modules for tech, finance, healthcare, and other professional fields.",
      icon: "🏢",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Head>
        <title>InterviewAI - Master Your Interview Skills with AI</title>
        <meta
          name="description"
          content="Practice interviews with AI and get real-time feedback to improve your chances of landing your dream job."
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
                {isLoggedIn
                  ? ["Dashboard", "Practice", "Analytics", "Resources"].map(
                      (item) => (
                        <a
                          key={item}
                          href={`/${item.toLowerCase().replace(" ", "-")}`}
                          className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                        >
                          {item}
                        </a>
                      )
                    )
                  : ["Home", "Practice", "Pricing"].map((item) => (
                      <a
                        key={item}
                        href={
                          item === "Pricing"
                            ? "/select-plan"
                            : `/${item.toLowerCase().replace(" ", "-")}`
                        }
                        className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                      >
                        {item}
                      </a>
                    ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="text-2xl">{userProfile.avatar}</span>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {userProfile.name}
                      </div>
                      <div className="text-blue-600">{userProfile.plan}</div>
                    </div>
                  </div>
                  <button
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <a
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogin(); // Simulate login for demo
                      // In real app: window.location.href = "/login"
                    }}
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </a>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {isLoggedIn
                ? ["Dashboard", "Practice", "Analytics", "Resources"].map(
                    (item) => (
                      <a
                        key={item}
                        href={`/${item.toLowerCase().replace(" ", "-")}`}
                        className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        {item}
                      </a>
                    )
                  )
                : ["Home", "Practice", "Pricing"].map((item) => (
                    <a
                      key={item}
                      href={
                        item === "Pricing"
                          ? "/select-plan"
                          : `/${item.toLowerCase().replace(" ", "-")}`
                      }
                      className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    >
                      {item}
                    </a>
                  ))}
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  {isLoggedIn ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{userProfile.avatar}</span>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {userProfile.name}
                          </div>
                          <div className="text-blue-600">
                            {userProfile.plan}
                          </div>
                        </div>
                      </div>
                      <button
                        className="text-gray-700 hover:text-blue-600"
                        onClick={() => setIsLoggedIn(false)}
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="block text-base font-medium text-gray-700 hover:text-blue-600"
                      >
                        Sign In
                      </a>
                      <a
                        href="/register"
                        className="ml-4 block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Get Started
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Master Your{" "}
              <span className="text-blue-600">Interview Skills</span> with AI
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Practice interviews with our advanced AI system. Get real-time
              feedback and improve your chances of landing your dream job.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                onClick={() => (window.location.href = "/practice")}
              >
                Start Free Practice
              </button>
              <button
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors duration-300 text-lg font-medium"
                onClick={() => (window.location.href = "/select-plan")}
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </section>

        {/* User Profile Dashboard - Only show if logged in */}
        {isLoggedIn && (
          <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                      {userProfile.avatar}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Welcome back, {userProfile.name}!
                      </h2>
                      <p className="text-gray-600">
                        Member since {userProfile.memberSince}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium shadow-md"
                      onClick={() =>
                        (window.location.href = "/profile-management")
                      }
                    >
                      👨‍💼 Edit Profile
                    </button>
                    <button
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 font-medium shadow-md"
                      onClick={saveProfileData}
                    >
                      💾 Save Profile
                    </button>
                    <button
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 font-medium shadow-md"
                      onClick={() => (window.location.href = "/select-plan")}
                    >
                      📋 Manage Plan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Plan Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Current Plan
                    </h3>
                    <p className="text-2xl font-bold text-blue-700">
                      {userProfile.plan}
                    </p>
                    <p className="text-blue-600 mt-2">
                      {userProfile.interviewsRemaining} interviews remaining
                    </p>
                    <button
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                      onClick={() => (window.location.href = "/select-plan")}
                    >
                      Upgrade Plan
                    </button>
                  </div>

                  {/* Progress Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Progress
                    </h3>
                    <p className="text-2xl font-bold text-green-700">
                      {userProfile.interviewsCompleted}
                    </p>
                    <p className="text-green-600 mt-2">Interviews completed</p>
                    <button
                      className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm"
                      onClick={() => (window.location.href = "/analytics")}
                    >
                      View Analytics
                    </button>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <button
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 text-sm"
                        onClick={() => (window.location.href = "/practice")}
                      >
                        Start Interview
                      </button>
                      <button
                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm"
                        onClick={() =>
                          (window.location.href = "/all-interviews")
                        }
                      >
                        View History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powerful Features to Help You Succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform provides everything you need to ace your
                next interview
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join thousands of professionals who have transformed their
              interview skills with InterviewAI
            </p>
            <button
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => (window.location.href = "/register")}
            >
              Start Your Free Trial
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Page;
