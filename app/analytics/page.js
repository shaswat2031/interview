"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

const AnalyticsPage = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("all"); // all, 30d, 7d
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchAnalyticsData();
  }, []);

  const fetchUserData = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/login";
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Fetch dashboard data for stats
      const dashboardResponse = await fetch("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDashboardData(dashboardData);
      }

      // Fetch all interviews for detailed analysis
      const interviewsResponse = await fetch("/api/interviews?limit=50", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (interviewsResponse.ok) {
        const interviewsData = await interviewsResponse.json();
        setInterviews(interviewsData.interviews || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    if (!interviews.length) return null;

    const completedInterviews = interviews.filter(
      (i) => i.status === "completed"
    );

    // Performance by type
    const typePerformance = {};
    completedInterviews.forEach((interview) => {
      if (!typePerformance[interview.type]) {
        typePerformance[interview.type] = { total: 0, scores: [], count: 0 };
      }
      typePerformance[interview.type].count++;
      if (interview.score !== undefined) {
        typePerformance[interview.type].scores.push(interview.score);
        typePerformance[interview.type].total += interview.score;
      }
    });

    Object.keys(typePerformance).forEach((type) => {
      const data = typePerformance[type];
      data.average =
        data.scores.length > 0 ? data.total / data.scores.length : 0;
    });

    // Performance by difficulty
    const difficultyPerformance = {};
    completedInterviews.forEach((interview) => {
      if (!difficultyPerformance[interview.difficulty]) {
        difficultyPerformance[interview.difficulty] = {
          total: 0,
          scores: [],
          count: 0,
        };
      }
      difficultyPerformance[interview.difficulty].count++;
      if (interview.score !== undefined) {
        difficultyPerformance[interview.difficulty].scores.push(
          interview.score
        );
        difficultyPerformance[interview.difficulty].total += interview.score;
      }
    });

    Object.keys(difficultyPerformance).forEach((difficulty) => {
      const data = difficultyPerformance[difficulty];
      data.average =
        data.scores.length > 0 ? data.total / data.scores.length : 0;
    });

    // Recent progress (last 10 interviews)
    const recentInterviews = completedInterviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .reverse();

    // Improvement trend
    const scores = recentInterviews.map((i) => i.score || 0);
    const improvementTrend =
      scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;

    return {
      typePerformance,
      difficultyPerformance,
      recentInterviews,
      improvementTrend,
      totalCompleted: completedInterviews.length,
      averageScore:
        completedInterviews.length > 0
          ? completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) /
            completedInterviews.length
          : 0,
    };
  };

  const analytics = calculateAnalytics();

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin h-16 w-16 mx-auto text-pink-600 mb-4" />
          <p className="text-gray-700 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100">
      <Head>
        <title>Analytics - InterviewAI</title>
        <meta
          name="description"
          content="Track your interview performance and progress"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mr-2">
                    <span className="text-white font-bold">IA</span>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    InterviewAI
                  </h1>
                </Link>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {[
                  {
                    name: "Dashboard",
                    href: "/dashboard",
                    active: false,
                  },
                  {
                    name: "Practice",
                    href: "/practice",
                    active: false,
                  },
                  {
                    name: "Analytics",
                    href: "/analytics",
                    active: true,
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
                <span className="text-2xl">👨‍💼</span>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
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
                active: false,
              },
              {
                name: "Practice",
                href: "/practice",
                active: false,
              },
              {
                name: "Analytics",
                href: "/analytics",
                active: true,
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
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.firstName} {user?.lastName}
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
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-2">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Performance Analytics 📊
              </h1>
              <p className="text-pink-100">
                Track your progress and identify areas for improvement
              </p>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="flex justify-end mb-6">
            <div className="inline-flex rounded-lg shadow-sm">
              {["all", "30d", "7d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium ${
                    timeRange === range
                      ? "bg-pink-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } ${range === "all" ? "rounded-l-lg" : ""} ${
                    range === "7d" ? "rounded-r-lg" : ""
                  } border border-gray-200`}
                >
                  {range === "all"
                    ? "All Time"
                    : range === "30d"
                    ? "Last 30 Days"
                    : "Last 7 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex">
                <div className="text-red-400">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!analytics || analytics.totalCompleted === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Analytics Data Available
              </h3>
              <p className="text-gray-600 mb-4">
                Complete some interviews to see your performance analytics and
                progress tracking.
              </p>
              <Link href="/interview-setup">
                <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-colors duration-300 shadow-md">
                  Start Your First Interview
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              {dashboardData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                    <div className="text-3xl font-bold text-pink-600">
                      {dashboardData.stats.totalInterviews}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Interviews Completed
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(
                        dashboardData.stats.averageScore
                      )}`}
                    >
                      {dashboardData.stats.averageScore}/10
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Average Score
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                    <div className="text-3xl font-bold text-green-600">
                      {dashboardData.stats.totalPracticeHours}h
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Practice Hours
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                    <div
                      className={`text-3xl font-bold ${
                        analytics.improvementTrend > 0
                          ? "text-green-600"
                          : analytics.improvementTrend < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {analytics.improvementTrend > 0 ? "+" : ""}
                      {analytics.improvementTrend.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Recent Trend
                    </div>
                  </div>
                </div>
              )}

              {/* Performance by Interview Type & Difficulty */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
                <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Performance by Type
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {Object.entries(analytics.typePerformance).map(
                        ([type, data]) => (
                          <div
                            key={type}
                            className="flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {type}
                                </span>
                                <span
                                  className={`text-sm font-semibold ${getScoreColor(
                                    data.average
                                  )}`}
                                >
                                  {data.average.toFixed(1)}/10
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    data.average >= 8
                                      ? "bg-gradient-to-r from-green-400 to-green-600"
                                      : data.average >= 6
                                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                      : "bg-gradient-to-r from-red-400 to-red-600"
                                  }`}
                                  style={{
                                    width: `${(data.average / 10) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {data.count} interview
                                {data.count !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Performance by Difficulty
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {Object.entries(analytics.difficultyPerformance).map(
                        ([difficulty, data]) => (
                          <div
                            key={difficulty}
                            className="flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {difficulty}
                                </span>
                                <span
                                  className={`text-sm font-semibold ${getScoreColor(
                                    data.average
                                  )}`}
                                >
                                  {data.average.toFixed(1)}/10
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    data.average >= 8
                                      ? "bg-gradient-to-r from-green-400 to-green-600"
                                      : data.average >= 6
                                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                      : "bg-gradient-to-r from-red-400 to-red-600"
                                  }`}
                                  style={{
                                    width: `${(data.average / 10) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {data.count} interview
                                {data.count !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Performance Trend */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Performance
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.recentInterviews.map((interview, index) => (
                      <div
                        key={interview._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-pink-50 hover:border-pink-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                          <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-gray-500 text-sm font-medium">
                            #{analytics.recentInterviews.length - index}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {interview.type} - {interview.company}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                interview.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreBgColor(
                              interview.score
                            )} ${getScoreColor(interview.score)}`}
                          >
                            {interview.score}/10
                          </span>
                          <Link href={`/interview-details/${interview._id}`}>
                            <button className="bg-white text-pink-600 hover:text-pink-700 border border-pink-200 hover:border-pink-300 rounded-lg text-sm px-4 py-1.5 shadow-sm transition-colors duration-200">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Improvement Recommendations
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Generate recommendations based on performance */}
                    {analytics.averageScore < 6 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex">
                          <div className="text-red-400 flex-shrink-0">
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-red-800">
                              Focus on Basic Skills
                            </h4>
                            <p className="text-sm text-red-700 mt-1">
                              Your average score suggests focusing on
                              fundamental interview skills. Practice with easier
                              questions first.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {analytics.improvementTrend < 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex">
                          <div className="text-yellow-400 flex-shrink-0">
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-yellow-800">
                              Recent Decline
                            </h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              Your recent scores show a declining trend.
                              Consider reviewing your last few interviews for
                              improvement areas.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {analytics.improvementTrend > 1 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex">
                          <div className="text-green-400 flex-shrink-0">
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-green-800">
                              Great Progress!
                            </h4>
                            <p className="text-sm text-green-700 mt-1">
                              You're showing consistent improvement. Keep up the
                              excellent work!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex">
                        <div className="text-blue-400 flex-shrink-0">
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">
                            Keep Practicing
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Regular practice is key to improvement. Try to
                            complete at least 2-3 interviews per week.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
