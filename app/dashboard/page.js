// Imports at the top of the file
"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import RenewInterviewsModal from "../components/RenewInterviewsModal";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    name: "",
    plan: "",
    planPrice: "",
    avatar: "👨‍💼",
    interviewsUsed: 0,
    interviewsLeft: 0,
    interviewsTotal: 0,
    averageScore: 0,
    practiceHours: 0,
    skillsImproved: 0,
    isBundle: false,
    nextBillingDate: "",
    memberSince: "",
  });

  const [recentInterviews, setRecentInterviews] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await fetch("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserStats(data.userStats);
          setRecentInterviews(data.recentInterviews || []);

          // Set current plan for the renewal modal
          const plansResponse = await fetch("/api/plans");
          if (plansResponse.ok) {
            const plansData = await plansResponse.json();
            const userPlan = plansData.plans.find(
              (p) => p.id === data.userStats.plan
            );
            if (userPlan) {
              setCurrentPlan(userPlan);
            }
          }
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else {
          // More detailed error handling
          const errorText = await response.text();
          console.error("Dashboard API error:", response.status, errorText);

          // Fallback to localStorage user data
          const userData = JSON.parse(localStorage.getItem("user") || "{}");
          if (userData) {
            setUserStats({
              name:
                `${userData.firstName || ""} ${
                  userData.lastName || ""
                }`.trim() || "User",
              plan: userData.plan || "",
              planPrice: "",
              avatar: "👨‍💼",
              interviewsUsed: 0,
              interviewsTotal:
                userData.plan === "free"
                  ? 1
                  : userData.plan === "starter"
                  ? 5
                  : -1,
              averageScore: 0,
              practiceHours: 0,
              skillsImproved: 0,
              trialActive: userData.subscriptionStatus === "trial",
              trialDaysLeft: 0,
              nextBillingDate: "",
              memberSince: "",
            });
          }
          console.error("Failed to fetch dashboard data, using fallback data");
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);

        // Fallback to localStorage user data
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        if (userData) {
          setUserStats({
            name:
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
              "User",
            plan: userData.plan || "",
            planPrice: "",
            avatar: "👨‍💼",
            interviewsUsed: 0,
            interviewsTotal:
              userData.plan === "free"
                ? 1
                : userData.plan === "starter"
                ? 5
                : -1,
            averageScore: 0,
            practiceHours: 0,
            skillsImproved: 0,
            trialActive: userData.subscriptionStatus === "trial",
            trialDaysLeft: 0,
            nextBillingDate: "",
            memberSince: "",
          });
        }
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleRenewInterviews = (newInterviewsCount) => {
    setUserStats((prev) => ({
      ...prev,
      interviewsLeft: newInterviewsCount,
    }));
  };
  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin h-16 w-16 mx-auto text-pink-600 mb-4" />
          <p className="text-gray-700 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100">
      <Head>
        <title>Dashboard - InterviewAI</title>
        <meta
          name="description"
          content="Your interview practice dashboard - track progress and manage your account"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">IA</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  InterviewAI
                </h1>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {[
                  {
                    name: "Dashboard",
                    href: "/dashboard",
                    active: true,
                  },
                  {
                    name: "Practice",
                    href: "/practice",
                    active: false,
                  },
                  {
                    name: "Analytics",
                    href: "/analytics",
                    active: false,
                  },
                  {
                    name: "Resources",
                    href: "/resources",
                    active: false,
                  },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 transition-colors duration-200 ${
                      item.active
                        ? "text-pink-600 border-b-2 border-pink-600"
                        : "text-gray-700 hover:text-pink-600"
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => (window.location.href = "/profile-management")}
                className="flex items-center space-x-2 bg-pink-50 px-3 py-2 rounded-xl hover:bg-pink-100 transition-colors duration-200 cursor-pointer"
              >
                <span className="text-2xl">{userStats?.avatar || "👨‍💼"}</span>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {userStats?.name || "User"}
                  </div>
                  <div className="text-pink-600">
                    {userStats?.plan
                      ? `${
                          userStats.plan.charAt(0).toUpperCase() +
                          userStats.plan.slice(1)
                        } Plan`
                      : "No Plan"}
                  </div>
                </div>
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-pink-600 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <IoMdClose className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <GiHamburgerMenu
                    className="block h-6 w-6"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-2 pt-2 pb-3 space-y-1">
            {[
              {
                name: "Dashboard",
                href: "/dashboard",
                active: true,
              },
              {
                name: "Practice",
                href: "/practice",
                active: false,
              },
              {
                name: "Analytics",
                href: "/analytics",
                active: false,
              },
              {
                name: "Resources",
                href: "/resources",
                active: false,
              },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  item.active
                    ? "text-pink-600 bg-pink-50"
                    : "text-gray-700 hover:bg-gray-50 hover:text-pink-600"
                }`}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{userStats?.avatar || "👨‍💼"}</span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {userStats?.name || "User"}
                  </div>
                  <div className="text-sm font-medium text-pink-600">
                    {userStats?.plan
                      ? `${
                          userStats.plan.charAt(0).toUpperCase() +
                          userStats.plan.slice(1)
                        } Plan`
                      : "No Plan"}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <a
                  href="/profile-management"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                >
                  Your Profile
                </a>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userStats?.name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-gray-700">
              Ready to practice and improve your interview skills?
            </p>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Interviews Left */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Interviews Left
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-pink-600">
                    {userStats?.interviewsLeft || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userStats?.isBundle
                      ? `Bundle of ${userStats?.interviewsTotal} interviews`
                      : `Refreshes ${userStats?.nextBillingDate || "monthly"}`}
                  </p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Average Score
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {userStats?.averageScore || 0}/10
                  </p>
                  <p className="text-xs text-gray-500">Across all interviews</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            {/* Practice Hours */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Practice Hours
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {userStats?.practiceHours || 0}h
                  </p>
                  <p className="text-xs text-gray-500">Total time practiced</p>
                </div>
                <div className="text-3xl">⏱️</div>
              </div>
            </div>

            {/* Skills Improved */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Skills Improved
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {userStats?.skillsImproved || 0}
                  </p>
                  <p className="text-xs text-gray-500">Areas of growth</p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>
          </div>

          {/* Current Plan & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            {/* Current Plan */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Current Plan
              </h2>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-1">
                  {userStats?.plan || "Free Plan"}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {userStats?.planPrice || "₹0"}
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  {userStats?.isBundle
                    ? `Bundle valid for ${
                        userStats?.validityMonths || 3
                      } months`
                    : `Interviews refresh monthly`}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  Interviews Used: {userStats?.interviewsUsed || 0}/
                  {userStats?.interviewsTotal || 0}
                </div>
                <div className="space-y-2 mt-4">
                  {userStats?.interviewsLeft <= 0 ? (
                    <>
                      <p className="text-red-500 text-sm mt-2 mb-2">
                        You have used all your interviews. Renew or upgrade to
                        continue practicing!
                      </p>
                      <button
                        className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 text-white py-2 px-4 rounded-xl hover:from-indigo-600 hover:to-indigo-800 transition-colors duration-300 text-sm mb-2"
                        onClick={() => setShowRenewModal(true)}
                      >
                        Renew Interviews
                      </button>
                    </>
                  ) : (
                    userStats?.interviewsLeft <= 2 && (
                      <>
                        <p className="text-amber-500 text-sm mt-2 mb-2">
                          You have only {userStats.interviewsLeft}{" "}
                          {userStats.interviewsLeft === 1
                            ? "interview"
                            : "interviews"}{" "}
                          left. Consider renewing early for a discount!
                        </p>
                        <button
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-white py-2 px-4 rounded-xl hover:from-amber-600 hover:to-amber-800 transition-colors duration-300 text-sm mb-2"
                          onClick={() => setShowRenewModal(true)}
                        >
                          Early Renewal (15% Off)
                        </button>
                      </>
                    )
                  )}
                  <button
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-colors duration-300 text-sm mb-2"
                    onClick={() => (window.location.href = "/select-plan")}
                  >
                    Upgrade Plan
                  </button>
                  <button
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-200 transition-colors duration-300 text-sm"
                    onClick={() =>
                      (window.location.href = "/profile-management")
                    }
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  className="bg-gradient-to-r from-pink-500 to-pink-700 text-white p-4 sm:p-6 rounded-2xl hover:from-pink-600 hover:to-pink-800 transition-colors duration-300 text-left shadow-md hover:shadow-lg"
                  onClick={() => (window.location.href = "/interview-setup")}
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    Start Interview
                  </h3>
                  <p className="text-pink-100 text-xs sm:text-sm">
                    Begin a practice session
                  </p>
                </button>

                <button
                  className="bg-gradient-to-r from-green-500 to-green-700 text-white p-4 sm:p-6 rounded-2xl hover:from-green-600 hover:to-green-800 transition-colors duration-300 text-left shadow-md hover:shadow-lg"
                  onClick={() => (window.location.href = "/practice")}
                >
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    Practice
                  </h3>
                  <p className="text-green-100 text-xs sm:text-sm">
                    AI-powered simulations
                  </p>
                </button>

                <button
                  className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4 sm:p-6 rounded-2xl hover:from-purple-600 hover:to-purple-800 transition-colors duration-300 text-left shadow-md hover:shadow-lg"
                  onClick={() => (window.location.href = "/analytics")}
                >
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    Analytics
                  </h3>
                  <p className="text-purple-100 text-xs sm:text-sm">
                    Performance insights
                  </p>
                </button>

                <button
                  className="bg-gradient-to-r from- orange-500 to-orange-700 text-white p-4 sm:p-6 rounded-2xl hover:from-orange-600 hover:to-orange-800 transition-colors duration-300 text-left shadow-md hover:shadow-lg"
                  onClick={() => (window.location.href = "/resources")}
                >
                  <div className="text-2xl mb-2">📖</div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    Resources
                  </h3>
                  <p className="text-orange-100 text-xs sm:text-sm">
                    Study materials
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Interviews */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                Recent Interviews
              </h2>
              <button
                className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                onClick={() => (window.location.href = "/all-interviews")}
              >
                View All Interviews →
              </button>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl sm:text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No interviews yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started with your first practice session
                </p>
                <button
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-colors duration-300 shadow-md"
                  onClick={() => (window.location.href = "/interview-setup")}
                >
                  Start Your First Interview
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInterviews.map((interview, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:bg-pink-50 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() =>
                      (window.location.href = `/interview-details/${interview._id}`)
                    }
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="mb-2 sm:mb-0">
                        <h4 className="font-medium text-gray-900">
                          {interview.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(interview.completedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-pink-600">
                          {interview.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-pink-600">
                          {interview.score}/10
                        </div>
                        <p className="text-sm text-gray-600">Score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile quick access floating button for small screens */}
          <div className="fixed bottom-6 right-6 md:hidden">
            <button
              onClick={() => (window.location.href = "/interview-setup")}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg flex items-center justify-center text-2xl"
            >
              🎯
            </button>
          </div>
        </div>
      </main>

      {/* Renewal Modal */}
      <RenewInterviewsModal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        currentPlan={currentPlan}
        onRenew={handleRenewInterviews}
        hasInterviewsLeft={userStats?.interviewsLeft > 0}
      />
    </div>
  );
};

export default Dashboard;
