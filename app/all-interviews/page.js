"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const AllInterviewsPage = () => {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    page: 1,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchUserData();
    fetchInterviews();
  }, [filters]);

  const fetchUserData = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/login";
    }
  };

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.type !== "all") params.append("type", filters.type);
      params.append("page", filters.page.toString());
      params.append("limit", "10");

      const response = await fetch(`/api/interviews?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch interviews");
      }

      const data = await response.json();
      setInterviews(data.interviews);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Completed",
      },
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Scheduled",
      },
      "in-progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "In Progress",
      },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getScoreDisplay = (score, status) => {
    if (status !== "completed" || score === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    const scoreColor =
      score >= 8
        ? "text-green-600"
        : score >= 6
        ? "text-yellow-600"
        : "text-red-600";
    return <span className={`font-semibold ${scoreColor}`}>{score}/10</span>;
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  if (loading && interviews.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>All Interviews - InterviewAI</title>
        <meta
          name="description"
          content="View all your interview sessions and practice history"
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
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                All Interviews
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and review all your interview sessions
              </p>
            </div>
            <Link href="/interview-setup">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                New Interview
              </button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="System Design">System Design</option>
                  <option value="Coding">Coding</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>

              <div className="ml-auto">
                <span className="text-sm text-gray-600">
                  {pagination.total || 0} interviews found
                </span>
              </div>
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

          {/* Interviews Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {interviews.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No interviews found
                </h3>
                <p className="text-gray-600 mb-4">
                  {filters.status !== "all" || filters.type !== "all"
                    ? "Try adjusting your filters or start a new interview."
                    : "Start your first interview practice to see your progress here."}
                </p>
                <Link href="/interview-setup">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Start New Interview
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interview
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {interviews.map((interview) => (
                        <tr key={interview._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {interview.type}
                              </div>
                              <div className="text-sm text-gray-500">
                                {interview.jobTitle || "General Position"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {interview.duration}min • {interview.difficulty}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {interview.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getScoreDisplay(interview.score, interview.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(interview.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{formatDate(interview.createdAt)}</div>
                            {interview.completedAt &&
                              interview.status === "completed" && (
                                <div className="text-xs text-gray-400">
                                  Completed: {formatDate(interview.completedAt)}
                                </div>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link href={`/interview-details/${interview._id}`}>
                              <button className="text-blue-600 hover:text-blue-900">
                                View Details
                              </button>
                            </Link>
                            {interview.status === "scheduled" && (
                              <>
                                <span className="text-gray-300">|</span>
                                <Link href={`/interview/${interview._id}`}>
                                  <button className="text-green-600 hover:text-green-900">
                                    Continue
                                  </button>
                                </Link>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() =>
                            handlePageChange(Math.max(1, filters.page - 1))
                          }
                          disabled={filters.page === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            handlePageChange(
                              Math.min(pagination.pages, filters.page + 1)
                            )
                          }
                          disabled={filters.page === pagination.pages}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                              {(filters.page - 1) * 10 + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(filters.page * 10, pagination.total)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                              {pagination.total}
                            </span>{" "}
                            results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                              onClick={() =>
                                handlePageChange(Math.max(1, filters.page - 1))
                              }
                              disabled={filters.page === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Previous
                            </button>
                            {[...Array(pagination.pages)].map((_, i) => {
                              const page = i + 1;
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === filters.page
                                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                            <button
                              onClick={() =>
                                handlePageChange(
                                  Math.min(pagination.pages, filters.page + 1)
                                )
                              }
                              disabled={filters.page === pagination.pages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllInterviewsPage;
