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

  // Function to start template interview with pre-filled data
  const startTemplateInterview = (templateType) => {
    const templates = {
      frontend: {
        type: "Technical",
        company: "Tech Startup",
        jobTitle: "Frontend Developer",
        difficulty: "Intermediate",
        duration: 45,
        focus: ["Problem Solving", "Technical Knowledge", "Code Quality"],
        customRequirements:
          "Focus on React, JavaScript, CSS, and modern frontend development practices",
      },
      software: {
        type: "Technical",
        company: "FAANG",
        jobTitle: "Software Engineer",
        difficulty: "Advanced",
        duration: 60,
        focus: [
          "Data Structures",
          "Algorithms",
          "System Architecture",
          "Problem Solving",
        ],
        customRequirements:
          "Focus on data structures, algorithms, system design, and coding best practices",
      },
      product: {
        type: "Behavioral",
        company: "Fortune 500",
        jobTitle: "Product Manager",
        difficulty: "Intermediate",
        duration: 30,
        focus: ["Leadership", "Communication", "Project Management"],
        customRequirements:
          "Focus on product strategy, leadership skills, and stakeholder communication",
      },
      devops: {
        type: "Technical",
        company: "Cloud Company",
        jobTitle: "DevOps Engineer",
        difficulty: "Advanced",
        duration: 50,
        focus: [
          "System Architecture",
          "Technical Knowledge",
          "Problem Solving",
        ],
        customRequirements:
          "Focus on AWS, Docker, Kubernetes, CI/CD pipelines, and cloud infrastructure",
      },
      datascience: {
        type: "Technical",
        company: "Tech Giant",
        jobTitle: "Data Scientist",
        difficulty: "Advanced",
        duration: 45,
        focus: ["Technical Knowledge", "Problem Solving", "Data Structures"],
        customRequirements:
          "Focus on Python, machine learning, statistics, SQL, and data analysis",
      },
      ux: {
        type: "Behavioral",
        company: "Design Agency",
        jobTitle: "UX Designer",
        difficulty: "Intermediate",
        duration: 40,
        focus: ["Communication", "Problem Solving", "Team Collaboration"],
        customRequirements:
          "Focus on design thinking, prototyping, user research, and design processes",
      },
    };

    const selectedTemplate = templates[templateType];
    if (selectedTemplate) {
      // Store template data in localStorage to be picked up by interview-setup page
      localStorage.setItem(
        "interviewTemplate",
        JSON.stringify(selectedTemplate)
      );
      // Redirect to interview setup page
      window.location.href = "/interview-setup";
    }
  };

  // Save profile function
  const saveProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first to save profile data");
        return;
      }

      // This function is now a placeholder - profile data should come from actual user state
      alert("⚠️ Profile data should be loaded from user authentication system");
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
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  InterviewAI
                </h1>
              </div>
              <div className="hidden md:ml-12 md:flex md:space-x-10">
                {isLoggedIn
                  ? ["Dashboard", "Practice", "Analytics", "Resources"].map(
                      (item) => (
                        <a
                          key={item}
                          href={`/${item.toLowerCase().replace(" ", "-")}`}
                          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group"
                        >
                          {item}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
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
                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group"
                      >
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
                      </a>
                    ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                    <button
                      className="text-2xl hover:scale-110 transition-transform duration-200 filter hover:brightness-110"
                      onClick={() =>
                        (window.location.href = "/profile-management")
                      }
                      title="View Profile"
                    >
                      👨‍💼
                    </button>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">
                        John Doe
                      </div>
                      <div className="text-blue-600 font-medium">Pro Plan</div>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    onClick={() => (window.location.href = "/login")}
                    title="Sign In"
                  >
                    <span className="text-lg">👨‍💼</span>
                    <span>Sign In</span>
                  </button>

                  <a
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-sm"
                  >
                    Get Started
                  </a>
                </div>
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
                        <button
                          className="text-2xl hover:scale-110 transition-transform duration-200"
                          onClick={() =>
                            (window.location.href = "/profile-management")
                          }
                          title="View Profile"
                        >
                          👨‍💼
                        </button>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">User</div>
                          <div className="text-blue-600">Plan</div>
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
                      <button
                        className="text-2xl hover:scale-110 transition-transform duration-200 mr-4"
                        onClick={() => (window.location.href = "/login")}
                        title="Login to view profile"
                      >
                        👨‍💼
                      </button>
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
              Boost Your <span className="text-blue-600">Interview Skills</span>{" "}
              with AI
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Practice interviews with our Gemini Based. Get real-time feedback
              and improve your chances of landing your dream job.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                onClick={() => (window.location.href = "/practice")}
              >
                Start Free Pratice
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
