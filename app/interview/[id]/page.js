"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useParams } from "next/navigation";
import SpeechRecorder from "@/app/components/SpeechRecorder";
// Remove direct imports of whisper-client
// Import the browser utility instead
import { isBrowser } from "@/app/lib/browser-utils";

// Will hold dynamically imported speech recognition functions
let speechRecognitionModule = null;

// Function to dynamically import the speech recognition module
const loadSpeechRecognition = async () => {
  if (!speechRecognitionModule && isBrowser()) {
    try {
      speechRecognitionModule = await import("@/app/lib/whisper-client");
    } catch (error) {
      console.error("Error loading speech recognition:", error);
      return null;
    }
  }
  return speechRecognitionModule;
};

const InterviewSessionPage = () => {
  const params = useParams();
  const interviewId = params.id;

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [speechVoice, setSpeechVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [speechToTextEnabled, setSpeechToTextEnabled] = useState(false);
  const [autoReadAnswer, setAutoReadAnswer] = useState(false);
  const [bufferMode, setBufferMode] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [recognitionBackoffTime, setRecognitionBackoffTime] = useState(0);
  const [networkRetryCount, setNetworkRetryCount] = useState(0);

  // Speech-to-text state using Hugging Face Whisper model
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);

  // Function to initialize speech recognition with Whisper model
  const initializeSpeechRecognition = async () => {
    try {
      setSpeechError(null);

      // Dynamically import the speech recognition module
      const speechModule = await loadSpeechRecognition();

      if (!speechModule) {
        setSpeechToTextEnabled(false);
        setSpeechError("Failed to load speech recognition module.");
        return;
      }

      const isSupported = speechModule.isSpeechToTextSupported();

      if (!isSupported) {
        setSpeechToTextEnabled(false);
        setSpeechError("Speech recognition is not supported in your browser.");
        return;
      }

      // Initialize the Whisper model
      await speechModule.initSpeechToText();
      setSpeechToTextEnabled(true);
      console.log("Speech recognition initialized successfully");
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setSpeechError(`Error initializing speech recognition: ${error.message}`);
      setSpeechToTextEnabled(false);
    }
  };

  // Function to start listening with SpeechRecorder component
  const startListening = () => {
    if (!speechToTextEnabled) return;

    // This is just a placeholder as the actual recording is now handled by the SpeechRecorder component
    // The user will need to click the "Start Speaking" button which activates the SpeechRecorder
    console.log(
      "Speech recognition is ready - click the Start Speaking button to begin"
    );
  };

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: value,
    }));
  };

  // Handle transcription from Whisper model
  const handleTranscriptionComplete = (text) => {
    if (!text) return;

    // Get current answer and append the transcription
    const currentAnswer = answers[currentQuestionIndex] || "";
    const newAnswer = currentAnswer ? `${currentAnswer} ${text}` : text;

    handleAnswerChange(newAnswer);
  };

  const clearAnswer = () => {
    handleAnswerChange("");
  };

  // Load interview data when component mounts
  useEffect(() => {
    fetchInterview();
  }, [interviewId]);

  useEffect(() => {
    let interval;
    if (sessionStarted && !sessionEnded && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted, sessionEnded, startTime]);

  const fetchInterview = async () => {
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

      // Initialize answers object
      const initialAnswers = {};
      data.questions.forEach((_, index) => {
        initialAnswers[index] = "";
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    setStartTime(Date.now());
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const endSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/interview/${interviewId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          elapsedTime,
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSessionEnded(true);
        // Fetch the updated interview with feedback
        setTimeout(() => {
          fetchInterviewWithFeedback();
        }, 1000);
      } else {
        throw new Error("Failed to save interview session");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Dummy speech functions that are not used anymore but might be referenced
  const speakText = (text) => {
    console.log("Speech functionality has been replaced with Whisper");
  };

  const speakQuestionWithContext = () => {
    console.log("Speech functionality has been replaced with Whisper");
  };

  const toggleListening = () => {
    console.log("Speech functionality has been replaced with Whisper");
    setIsListening((prev) => !prev);
  };

  const speakCompleteAnswer = () => {
    console.log("Speech functionality has been replaced with Whisper");
  };

  const speakAnswer = () => {
    console.log("Speech functionality has been replaced with Whisper");
  };

  const stopSpeaking = () => {
    console.log("Speech functionality has been replaced with Whisper");
    setIsSpeaking(false);
  };

  const fetchInterviewWithFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/interview/${interviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Interview Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Interview Session - InterviewAI</title>
        <meta
          name="description"
          content="AI-powered interview practice session"
        />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {interview.type} Interview - {interview.company}
              </h1>
              <p className="text-sm text-gray-600">
                {interview.jobTitle} | {interview.difficulty} Level
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {sessionStarted && (
                <div className="text-lg font-mono">
                  ⏱️ {formatTime(elapsedTime)}
                </div>
              )}
              {sessionStarted && !sessionEnded && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className={`px-3 py-1 rounded text-sm ${
                      speechEnabled
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    🔊 {speechEnabled ? "ON" : "OFF"}
                  </button>
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
                    >
                      Stop Reading
                    </button>
                  )}
                  {/* Speech Rate Control */}
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Speed:</span>
                    <select
                      value={speechRate}
                      onChange={(e) =>
                        setSpeechRate(parseFloat(e.target.value))
                      }
                      className="text-xs border rounded px-1 py-0.5"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.7}>0.7x</option>
                      <option value={0.8}>0.8x</option>
                      <option value={1.0}>1x</option>
                      <option value={1.2}>1.2x</option>
                      <option value={1.5}>1.5x</option>
                    </select>
                  </div>
                </div>
              )}
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                Exit Interview
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!sessionStarted ? (
          /* Pre-Interview Screen */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Interview?
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Type:</strong> {interview.type}
                </div>
                <div>
                  <strong>Company:</strong> {interview.company}
                </div>
                <div>
                  <strong>Duration:</strong> {interview.duration} minutes
                </div>
                <div>
                  <strong>Questions:</strong> {interview.questions.length}
                </div>
                <div className="col-span-2">
                  <strong>Focus:</strong> {interview.focus.join(", ")}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">
                Interview Tips:
              </h3>
              <ul className="text-blue-800 text-sm text-left list-disc list-inside space-y-1">
                <li>Questions will be presented one at a time</li>
                <li>You can type your answers or use speech recognition</li>
                <li>Use the microphone button to record your speech</li>
                <li>You can also type manually if preferred</li>
                <li>Take your time to think before answering</li>
                <li>Use specific examples from your experience</li>
                <li>Enable auto-read to hear your answers as you type</li>
              </ul>
            </div>
            <button
              onClick={startSession}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700"
            >
              Start Interview 🚀
            </button>
          </div>
        ) : sessionEnded ? (
          /* Post-Interview Screen */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Interview Completed!
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {interview.questions.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Questions Answered
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="text-sm text-gray-600">Time Taken</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(answers).filter((a) => a.trim()).length}
                  </div>
                  <div className="text-sm text-gray-600">Responses Given</div>
                </div>
              </div>
            </div>

            {/* AI Feedback Section */}
            {feedback ? (
              <div className="bg-white border rounded-lg p-6 mb-8 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Feedback & Analysis
                  </h3>
                  <div className="text-2xl font-bold text-green-600">
                    {feedback.aiScore}/100
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Strengths */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-3 flex items-center">
                      <span className="mr-2">💪</span> Strengths
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                      <span className="mr-2">📈</span> Areas for Improvement
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {feedback.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">💡</span> Recommendations
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {feedback.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Overall Feedback */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Overall Assessment
                  </h4>
                  <p className="text-sm text-gray-700">
                    {feedback.overallFeedback}
                  </p>
                </div>

                {/* Show/Hide Detailed Analysis */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowFeedback(!showFeedback)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showFeedback ? "Hide" : "Show"} Detailed Analysis
                  </button>
                  {showFeedback && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {feedback.detailedAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600 mr-3"
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
                  <span className="text-blue-800">
                    AI is analyzing your interview performance...
                  </span>
                </div>
              </div>
            )}
            <div className="space-x-4">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => (window.location.href = "/interview-setup")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Start New Interview
              </button>
            </div>
          </div>
        ) : (
          /* Interview Screen */
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionIndex + 1} of{" "}
                  {interview.questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                    {currentQuestion.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Est. {currentQuestion.estimatedTime} min
                    </span>
                    <button
                      onClick={() => speakText(currentQuestion.question)}
                      disabled={isSpeaking}
                      className="text-blue-600 hover:text-blue-700 disabled:opacity-50 text-sm"
                      title="Read question aloud"
                    >
                      🔊 Question
                    </button>
                    <button
                      onClick={speakQuestionWithContext}
                      disabled={isSpeaking}
                      className="text-purple-600 hover:text-purple-700 disabled:opacity-50 text-sm"
                      title="Read question with context"
                    >
                      📖 Full
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.context && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg relative">
                    <strong>Context:</strong> {currentQuestion.context}
                    <button
                      onClick={() => speakText(currentQuestion.context)}
                      disabled={isSpeaking}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      title="Read context aloud"
                    >
                      🔊
                    </button>
                  </div>
                )}
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1 text-xs">
                      <input
                        type="checkbox"
                        checked={autoReadAnswer}
                        onChange={(e) => setAutoReadAnswer(e.target.checked)}
                        className="rounded"
                      />
                      <span>Auto-read</span>
                    </label>
                    <button
                      onClick={speakCompleteAnswer}
                      disabled={
                        isSpeaking || !answers[currentQuestionIndex]?.trim()
                      }
                      className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Read your complete answer aloud"
                    >
                      🔊 Read Answer
                    </button>
                    <span className="text-xs text-gray-500">
                      {answers[currentQuestionIndex]?.length || 0} characters
                    </span>
                  </div>
                </div>

                {/* Speech Controls */}
                <div className="mb-3 flex items-center space-x-3 flex-wrap gap-2">
                  <button
                    onClick={clearAnswer}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                  >
                    Clear Answer
                  </button>

                  {/* Network status indicator */}
                  {isOfflineMode && (
                    <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-xs flex items-center">
                      <span className="mr-1">📶</span>
                      <span>
                        Offline Mode - Speech recognition will use local
                        buffering
                      </span>
                    </div>
                  )}

                  {/* Manual retry button for network errors */}
                  {speechError && speechError.includes("Network") && (
                    <button
                      onClick={() => {
                        setSpeechError(null);
                        setNetworkRetryCount(0);
                        setIsOfflineMode(false);
                        setSpeechToTextEnabled(true);
                        setBufferMode(false);
                        initializeSpeechRecognition();
                        setTimeout(() => startListening(), 500);
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    >
                      🔄 Retry Connection
                    </button>
                  )}

                  {!speechToTextEnabled && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-orange-600">
                        ⚠️ Speech-to-text disabled
                      </span>
                      <button
                        onClick={() => {
                          setSpeechToTextEnabled(true);
                          setSpeechError(null);
                          setNetworkRetryCount(0);
                          setIsOfflineMode(false);
                          initializeSpeechRecognition();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        Re-enable
                      </button>
                    </div>
                  )}

                  {/* Speech Error Display */}
                  {speechError && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-red-600">
                        ⚠️ {speechError}
                      </span>
                      {speechError.includes("Retrying") && (
                        <div className="text-xs text-blue-600">
                          <div className="animate-spin inline-block w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-1"></div>
                          <span>Retrying in {recognitionBackoffTime}s</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Browser compatibility check */}
                  {!(
                    "webkitSpeechRecognition" in window ||
                    "SpeechRecognition" in window
                  ) && (
                    <span className="text-xs text-red-600">
                      ⚠️ Speech recognition not supported in this browser. Try
                      Chrome or Edge.
                    </span>
                  )}
                </div>

                <textarea
                  value={answers[currentQuestionIndex] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type your answer here..."
                />

                {/* Whisper-based Speech-to-Text Component */}
                <div className="mt-4 flex justify-center">
                  <SpeechRecorder
                    onTranscriptionComplete={handleTranscriptionComplete}
                    isDisabled={!sessionStarted || sessionEnded}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-xs text-gray-500">
                      💡 Use the microphone button to record your answer with
                      Whisper AI speech recognition
                    </p>
                    {isProcessingSpeech && (
                      <span className="text-xs text-blue-600 animate-pulse">
                        🎙️ Processing speech...
                      </span>
                    )}
                  </div>
                  {answers[currentQuestionIndex]?.trim() && (
                    <div className="text-xs text-gray-500">
                      Word count: ~
                      {answers[currentQuestionIndex].trim().split(/\s+/).length}{" "}
                      words
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex space-x-3">
                  {currentQuestionIndex === interview.questions.length - 1 ? (
                    <button
                      onClick={endSession}
                      className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Complete Interview ✓
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InterviewSessionPage;
