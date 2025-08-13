"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import RenewInterviewsModal from "../components/RenewInterviewsModal";

const InterviewSetupPage = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [interviewData, setInterviewData] = useState({
    type: "",
    company: "",
    jobTitle: "",
    difficulty: "Intermediate",
    duration: 30,
    focus: [],
    customRequirements: "",
  });

  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchUserStats();
    loadTemplateData();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const data = await response.json();
        const userPlanId = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")).plan
          : "free";

        const plan = data.plans.find((p) => p.id === userPlanId);
        if (plan) {
          setCurrentPlan(plan);
        }
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else if (response.status === 401) {
        // Authentication issue
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        console.error("Error fetching user stats:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const handleRenewInterviews = (newInterviewsCount) => {
    setUserStats((prev) => ({
      ...prev,
      interviewsLeft: newInterviewsCount,
    }));
    setError(""); // Clear any previous errors
  };

  const loadTemplateData = () => {
    try {
      const templateData = localStorage.getItem("interviewTemplate");
      if (templateData) {
        const template = JSON.parse(templateData);

        // Pre-fill the form with template data
        setInterviewData({
          type: template.type || "",
          company: template.company || "",
          jobTitle: template.jobTitle || "",
          difficulty: template.difficulty || "Intermediate",
          duration: template.duration || 30,
          focus: template.focus || [],
          customRequirements: template.customRequirements || "",
        });

        // Clear the template data from localStorage after using it
        localStorage.removeItem("interviewTemplate");

        // Auto-advance to step 2 since template is pre-filled
        setStep(2);
      }
    } catch (err) {
      console.error("Error loading template data:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      setLoading(true);

      const response = await fetch("/api/profile/setup", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);

        // Pre-fill some data from profile
        setInterviewData((prev) => ({
          ...prev,
          jobTitle: data.jobRole?.target || "",
          difficulty: data.preferences?.difficulty || "Intermediate",
          duration: data.preferences?.duration || 30,
          focus: data.preferences?.interviewTypes || [],
        }));
      } else if (response.status === 404) {
        // Profile doesn't exist yet, that's okay
        console.log("No profile found, user can create one");
      } else if (response.status === 401) {
        // Authentication issue
        console.error("Authentication error. Redirecting to login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        // Handle other errors
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: "Unknown server error" };
        }

        console.error("Error fetching profile:", response.status, errorData);
        setError(
          `Failed to load profile: ${errorData.message || response.statusText}`
        );
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(
        "Network error while loading profile. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear error for this field when user makes a change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }

    setInterviewData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep1 = () => {
    const errors = {};
    if (!interviewData.type) {
      errors.type = "Interview type is required";
    }
    if (!interviewData.company) {
      errors.company = "Company name is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleFocusToggle = (focus) => {
    setInterviewData((prev) => ({
      ...prev,
      focus: prev.focus.includes(focus)
        ? prev.focus.filter((f) => f !== focus)
        : [...prev.focus, focus],
    }));
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewData,
          profile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      setGeneratedQuestions(data.questions);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...interviewData,
          questions: generatedQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.planLimit) {
          // Handle plan limit error specifically
          setError(
            `${data.error} You are currently on the ${
              data.userPlan || "free"
            } plan.`
          );
          // Show the renewal modal
          setShowRenewModal(true);
          // Refresh user stats to show updated limit status
          await fetchUserStats();
        } else {
          throw new Error(data.error || "Failed to start interview");
        }
        return;
      }

      // Redirect to interview session
      window.location.href = `/interview/${data.interviewId}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const interviewTypes = [
    "Technical",
    "Behavioral",
    "System Design",
    "Coding",
    "Leadership",
    "Product Management",
  ];

  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  const focusAreas = [
    "Problem Solving",
    "Communication",
    "Technical Knowledge",
    "Leadership",
    "Team Collaboration",
    "Project Management",
    "System Architecture",
    "Code Quality",
    "Data Structures",
    "Algorithms",
    "Database Design",
    "API Design",
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {error ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Profile Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => fetchProfile()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {loading ? "Loading profile..." : "Initializing..."}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Setup Interview - InterviewAI</title>
        <meta
          name="description"
          content="Set up your personalized AI interview session"
        />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">🎯</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            Setup Your Interview
          </h1>
          <p className="text-lg text-gray-600">
            Let's create a personalized interview experience for you
          </p>
        </div>

        {/* Plan Status */}
        {userStats && (
          <div className="mb-8">
            <div
              className={`rounded-lg p-4 ${
                userStats.interviewsUsed < userStats.interviewsTotal
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`font-medium ${
                      userStats.interviewsUsed < userStats.interviewsTotal
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {userStats.isBundle
                      ? "Bundle Plan"
                      : `${
                          userStats.plan?.charAt(0).toUpperCase() +
                            userStats.plan?.slice(1) || "Free"
                        } Plan`}
                  </h3>
                  <p
                    className={`text-sm ${
                      userStats &&
                      userStats.interviewsUsed < userStats.interviewsTotal
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Interviews Used: {userStats?.interviewsUsed || 0} /{" "}
                    {userStats?.interviewsTotal || 0}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {userStats.interviewsUsed >= userStats.interviewsTotal ? (
                    <button
                      onClick={() => (window.location.href = "/select-plan")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Upgrade Plan
                    </button>
                  ) : (
                    <span className="text-green-600 text-2xl">✓</span>
                  )}
                </div>
              </div>
              {userStats.interviewsUsed >= userStats.interviewsTotal && (
                <div className="mt-2">
                  <p className="text-red-600 text-sm">
                    You've reached your plan limit. Upgrade to continue taking
                    interviews.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { number: 1, title: "Interview Details", active: step >= 1 },
              { number: 2, title: "Generate Questions", active: step >= 2 },
              { number: 3, title: "Review & Start", active: step >= 3 },
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    stepItem.active
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {stepItem.number}
                </div>
                <span
                  className={`ml-3 text-sm font-medium ${
                    stepItem.active ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {stepItem.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Step 1: Interview Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Type *
                  </label>
                  <select
                    value={interviewData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.type ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select interview type</option>
                    {interviewTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.type && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={interviewData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className={`w-full px-4 py-3 border ${
                      fieldErrors.company ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="e.g., Google, Microsoft, Startup XYZ"
                  />
                  {fieldErrors.company && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.company}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={interviewData.jobTitle}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Position you're interviewing for"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={interviewData.difficulty}
                    onChange={(e) =>
                      handleInputChange("difficulty", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={interviewData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Focus Areas (Select multiple)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {focusAreas.map((focus) => (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => handleFocusToggle(focus)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        interviewData.focus.includes(focus)
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Requirements (Optional)
                </label>
                <textarea
                  value={interviewData.customRequirements}
                  onChange={(e) =>
                    handleInputChange("customRequirements", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any specific topics, technologies, or requirements you want to focus on..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Generate Questions
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Generate Questions */}
          {step === 2 && (
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to Generate Your Interview Questions?
                </h3>
                <p className="text-gray-600 mb-6">
                  Our AI will create personalized questions based on your
                  profile and the job requirements.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Interview Summary:
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Type:</strong> {interviewData.type}
                    </div>
                    <div>
                      <strong>Company:</strong> {interviewData.company}
                    </div>
                    <div>
                      <strong>Role:</strong> {interviewData.jobTitle}
                    </div>
                    <div>
                      <strong>Duration:</strong> {interviewData.duration}{" "}
                      minutes
                    </div>
                    <div>
                      <strong>Difficulty:</strong> {interviewData.difficulty}
                    </div>
                    <div className="col-span-2">
                      <strong>Focus Areas:</strong>{" "}
                      {interviewData.focus.join(", ")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating Questions...
                    </>
                  ) : (
                    "Generate Questions with AI"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Start */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Personalized Interview Questions
                </h3>
                <p className="text-gray-600 mb-6">
                  Review the generated questions below. You can start the
                  interview when ready.
                </p>

                <div className="space-y-4 mb-8">
                  {generatedQuestions.map((question, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-1">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">
                            {question.question}
                          </p>
                          {question.category && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {question.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Tips for Your Interview:
                      </h4>
                      <ul className="text-blue-800 text-sm mt-1 list-disc list-inside">
                        <li>Speak clearly and at a comfortable pace</li>
                        <li>Take your time to think before answering</li>
                        <li>Use specific examples from your experience</li>
                        <li>Ask clarifying questions if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Regenerate Questions
                </button>
                <button
                  type="button"
                  onClick={startInterview}
                  disabled={
                    loading ||
                    (userStats &&
                      userStats.interviewsTotal !== -1 &&
                      userStats.interviewsUsed >= userStats.interviewsTotal)
                  }
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Starting Interview...
                    </>
                  ) : userStats &&
                    userStats.interviewsTotal !== -1 &&
                    userStats.interviewsUsed >= userStats.interviewsTotal ? (
                    "Upgrade Plan to Continue"
                  ) : (
                    "Start Interview 🚀"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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

export default InterviewSetupPage;
