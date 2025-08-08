"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    name: "",
    plan: "",
    planPrice: "",
    avatar: "👨‍💼",
    interviewsUsed: 0,
    interviewsTotal: 0,
    averageScore: 0,
    practiceHours: 0,
    skillsImproved: 0,
    trialActive: false,
    trialDaysLeft: 0,
    nextBillingDate: "",
    memberSince: "",
  });

  const [recentInterviews, setRecentInterviews] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

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
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
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

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Head>
        <title>Dashboard - InterviewAI</title>
        <meta
          name="description"
          content="Your interview practice dashboard - track progress and manage your account"
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
                  { name: "Dashboard", href: "/dashboard", active: true },
                  { name: "Practice", href: "/practice", active: false },
                  { name: "Analytics", href: "/analytics", active: false },
                  { name: "Resources", href: "/resources", active: false },
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
              <button
                onClick={() => (window.location.href = "/profile-management")}
                className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
              >
                <span className="text-2xl">{userStats?.avatar || "👨‍💼"}</span>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {userStats?.name || "User"}
                  </div>
                  <div className="text-blue-600">
                    {userStats?.plan ? `${userStats.plan} Plan` : "No Plan"}
                  </div>
                </div>
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userStats?.name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to practice and improve your interview skills?
            </p>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Interviews Left */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Interviews Left
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {userStats?.plan === "Weekly" || userStats?.plan === "Monthly"
                      ? "∞"
                      : Math.max(
                          0,
                          (userStats?.interviewsTotal || 0) - (userStats?.interviewsUsed || 0)
                        )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Used: {userStats?.interviewsUsed || 0} /{" "}
                    {userStats?.plan === "Weekly" || userStats?.plan === "Monthly"
                      ? "∞"
                      : userStats?.interviewsTotal || 0}
                  </p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Average Score
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {userStats?.averageScore || 0}/10
                  </p>
                  <p className="text-xs text-gray-500">Across all interviews</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            {/* Practice Hours */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Practice Hours
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {userStats?.practiceHours || 0}h
                  </p>
                  <p className="text-xs text-gray-500">Total time practiced</p>
                </div>
                <div className="text-3xl">⏱️</div>
              </div>
            </div>

            {/* Skills Improved */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Skills Improved
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {userStats?.skillsImproved || 0}
                  </p>
                  <p className="text-xs text-gray-500">Areas of growth</p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>
          </div>

          {/* Current Plan & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Current Plan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Plan
              </h2>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {userStats?.plan || "No Plan"}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {userStats?.planPrice || ""}
                </div>
                {userStats?.trialActive && (
                  <div className="text-sm text-green-600 font-medium mb-2">
                    Trial Active - {userStats?.trialDaysLeft || 0} days left
                  </div>
                )}
                {userStats?.nextBillingDate && (
                  <div className="text-xs text-gray-500 mb-4">
                    Next billing:{" "}
                    {new Date(userStats.nextBillingDate).toLocaleDateString()}
                  </div>
                )}
                <div className="space-y-2">
                  <button
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                    onClick={() => (window.location.href = "/pricing")}
                  >
                    Manage Plan
                  </button>
                  <button
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm"
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors duration-300 text-left"
                  onClick={() => (window.location.href = "/interview-setup")}
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="text-lg font-semibold mb-1">
                    Start Interview
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Begin a practice session
                  </p>
                </button>

                <button
                  className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors duration-300 text-left"
                  onClick={() => (window.location.href = "/practice")}
                >
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="text-lg font-semibold mb-1">Practice</h3>
                  <p className="text-green-100 text-sm">
                    AI-powered simulations
                  </p>
                </button>

                <button
                  className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors duration-300 text-left"
                  onClick={() => (window.location.href = "/analytics")}
                >
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="text-lg font-semibold mb-1">Analytics</h3>
                  <p className="text-purple-100 text-sm">
                    Performance insights
                  </p>
                </button>

                <button
                  className="bg-orange-600 text-white p-6 rounded-xl hover:bg-orange-700 transition-colors duration-300 text-left"
                  onClick={() => (window.location.href = "/resources")}
                >
                  <div className="text-2xl mb-2">📖</div>
                  <h3 className="text-lg font-semibold mb-1">Resources</h3>
                  <p className="text-orange-100 text-sm">Study materials</p>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Interviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Interviews
              </h2>
              <button
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                onClick={() => (window.location.href = "/all-interviews")}
              >
                View All Interviews →
              </button>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No interviews yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started with your first practice session
                </p>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
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
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/interview-details/${interview._id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {interview.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(interview.completedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-blue-600">
                          {interview.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
