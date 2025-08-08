"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";

const InterviewDetailsPage = () => {
  const params = useParams();
  const interviewId = params.id;

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    if (interviewId) {
      fetchInterviewDetails();
    }
  }, [interviewId]);

  const fetchUserData = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/login";
    }
  };

  const fetchInterviewDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`/api/interview/${interviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Interview not found");
      }

      const data = await response.json();
      setInterview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Interview Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/practice">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Back to Practice
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Interview Details - InterviewAI</title>
        <meta
          name="description"
          content="View detailed interview results and feedback"
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
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href="/practice"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
              >
                ← Back to Practice
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Interview Details
              </h1>
            </div>
            <div className="text-right">{getStatusBadge(interview.status)}</div>
          </div>

          {/* Interview Overview */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {interview.type} Interview
                  </h2>
                  <p className="text-blue-100 text-lg">{interview.company}</p>
                  {interview.jobTitle && (
                    <p className="text-blue-200 text-sm">
                      Position: {interview.jobTitle}
                    </p>
                  )}
                </div>
                {interview.score !== undefined && (
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {interview.score}/10
                    </div>
                    <div className="text-blue-200 text-sm">Final Score</div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {interview.difficulty}
                  </div>
                  <div className="text-sm text-gray-500">Difficulty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {interview.duration}min
                  </div>
                  <div className="text-sm text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {interview.questions?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {interview.timeSpent
                      ? Math.round(interview.timeSpent / 60)
                      : 0}
                    min
                  </div>
                  <div className="text-sm text-gray-500">Time Spent</div>
                </div>
              </div>

              {interview.focus && interview.focus.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interview.focus.map((area, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>{" "}
                  <span className="text-gray-600">
                    {formatDate(interview.createdAt)}
                  </span>
                </div>
                {interview.completedAt && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Completed:
                    </span>{" "}
                    <span className="text-gray-600">
                      {formatDate(interview.completedAt)}
                    </span>
                  </div>
                )}
                {interview.scheduledFor && interview.status === "scheduled" && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Scheduled For:
                    </span>{" "}
                    <span className="text-gray-600">
                      {formatDate(interview.scheduledFor)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Questions and Answers */}
          {interview.questions && interview.questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Questions & Answers
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {interview.questions.map((question, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              Question {index + 1}
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {question.category}
                            </span>
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                              {question.difficulty}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {question.question}
                          </h4>
                          {question.context && (
                            <p className="text-sm text-gray-600 mb-3">
                              {question.context}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          ~{question.estimatedTime}min
                        </div>
                      </div>

                      {interview.answers && interview.answers[index] && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-700 mb-2">
                            Your Answer:
                          </h5>
                          <p className="text-gray-600 whitespace-pre-wrap">
                            {interview.answers[index]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Feedback */}
          {interview.feedback && interview.status === "completed" && (
            <div className="bg-white rounded-lg shadow-lg mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  AI Feedback & Analysis
                </h3>
              </div>
              <div className="p-6">
                {interview.feedback.overallFeedback && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Overall Assessment
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {interview.feedback.overallFeedback}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interview.feedback.strengths &&
                    interview.feedback.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 mb-3 flex items-center">
                          ✅ Strengths
                        </h4>
                        <ul className="space-y-2">
                          {interview.feedback.strengths.map(
                            (strength, index) => (
                              <li
                                key={index}
                                className="text-gray-700 flex items-start"
                              >
                                <span className="text-green-500 mr-2">•</span>
                                {strength}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {interview.feedback.weaknesses &&
                    interview.feedback.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-3 flex items-center">
                          ⚠️ Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {interview.feedback.weaknesses.map(
                            (weakness, index) => (
                              <li
                                key={index}
                                className="text-gray-700 flex items-start"
                              >
                                <span className="text-red-500 mr-2">•</span>
                                {weakness}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>

                {interview.feedback.recommendations &&
                  interview.feedback.recommendations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                        💡 Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {interview.feedback.recommendations.map(
                          (recommendation, index) => (
                            <li
                              key={index}
                              className="text-gray-700 flex items-start"
                            >
                              <span className="text-blue-500 mr-2">•</span>
                              {recommendation}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {interview.feedback.detailedAnalysis && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Detailed Analysis
                    </h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {interview.feedback.detailedAnalysis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link href="/practice">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Back to Practice
              </button>
            </Link>

            {interview.status === "completed" && (
              <Link href="/interview-setup">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Practice Similar Interview
                </button>
              </Link>
            )}

            {interview.status === "scheduled" && (
              <Link href={`/interview/${interview._id}`}>
                <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Continue Interview
                </button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewDetailsPage;
