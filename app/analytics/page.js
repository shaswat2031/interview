"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const AnalyticsPage = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("all"); // all, 30d, 7d

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Analytics - InterviewAI</title>
        <meta
          name="description"
          content="Track your interview performance and progress"
        />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">
                  InterviewAI
                </span>
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/practice"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Practice
                </Link>
                <Link
                  href="/analytics"
                  className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Analytics
                </Link>
                <Link
                  href="/resources"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Resources
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                👨‍💼 {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">
                Performance Analytics 📊
              </h1>
              <p className="text-purple-100">
                Track your progress and identify areas for improvement
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Analytics Data Available
              </h3>
              <p className="text-gray-600 mb-4">
                Complete some interviews to see your performance analytics and
                progress tracking.
              </p>
              <Link href="/interview-setup">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Start Your First Interview
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {dashboardData.stats.totalInterviews}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Interviews Completed
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
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
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {dashboardData.stats.totalPracticeHours}h
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Practice Hours
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
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

              {/* Performance by Interview Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow">
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
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    data.average >= 8
                                      ? "bg-green-500"
                                      : data.average >= 6
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
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

                {/* Performance by Difficulty */}
                <div className="bg-white rounded-lg shadow">
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
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    data.average >= 8
                                      ? "bg-green-500"
                                      : data.average >= 6
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
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
              <div className="bg-white rounded-lg shadow mb-8">
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
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium text-gray-500">
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
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBgColor(
                              interview.score
                            )} ${getScoreColor(interview.score)}`}
                          >
                            {interview.score}/10
                          </span>
                          <Link href={`/interview-details/${interview._id}`}>
                            <button className="text-blue-600 hover:text-blue-900 text-sm">
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
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Improvement Recommendations
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Generate recommendations based on performance */}
                    {analytics.averageScore < 6 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                          <div className="text-red-400">
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
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                          <div className="text-yellow-400">
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
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex">
                          <div className="text-green-400">
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

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="text-blue-400">
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
