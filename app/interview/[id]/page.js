"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useParams } from "next/navigation";

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [speechVoice, setSpeechVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [autoReadAnswer, setAutoReadAnswer] = useState(true);
  const [lastAnswerLength, setLastAnswerLength] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechToTextEnabled, setSpeechToTextEnabled] = useState(true);
  const [speechError, setSpeechError] = useState(null);
  const [networkRetryCount, setNetworkRetryCount] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [bufferMode, setBufferMode] = useState(false);
  const [recognitionBackoffTime, setRecognitionBackoffTime] = useState(2000);

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: value,
    }));

    // Auto-read answer as user types (with debouncing)
    if (
      autoReadAnswer &&
      speechEnabled &&
      value.length > lastAnswerLength + 10
    ) {
      // Read the newly added text (last sentence or phrase)
      const newText = value.slice(lastAnswerLength);
      const sentences = newText
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      if (sentences.length > 0) {
        const lastSentence = sentences[sentences.length - 1].trim();
        if (lastSentence.length > 5) {
          setTimeout(() => {
            speakText(lastSentence, { rate: speechRate * 1.2 }); // Slightly faster for auto-read
          }, 500);
        }
      }
      setLastAnswerLength(value.length);
    } else if (value.length < lastAnswerLength) {
      setLastAnswerLength(value.length);
    }
  };

  // Enhanced Text-to-Speech functionality
  const loadVoices = () => {
    if ("speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      // Filter to English voices only
      const englishVoices = voices.filter((voice) =>
        voice.lang.toLowerCase().includes("en")
      );
      setAvailableVoices(englishVoices);

      // Set default voice (prefer female English voice, then any English voice)
      const defaultVoice =
        englishVoices.find(
          (voice) =>
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("samantha") ||
            voice.name.toLowerCase().includes("karen") ||
            voice.name.toLowerCase().includes("susan")
        ) ||
        englishVoices.find((voice) => voice.lang === "en-US") ||
        englishVoices.find((voice) => voice.lang.includes("en-GB")) ||
        englishVoices[0];
      setSpeechVoice(defaultVoice);
    }
  };

  const speakText = (text, options = {}) => {
    if ("speechSynthesis" in window && speechEnabled && text.trim()) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || speechRate;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 0.8;
      utterance.lang = "en-US"; // Force English

      if (speechVoice) {
        utterance.voice = speechVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakQuestionWithContext = () => {
    const currentQuestion = interview.questions[currentQuestionIndex];
    let textToSpeak = `Question ${currentQuestionIndex + 1}: ${
      currentQuestion.question
    }`;

    if (currentQuestion.context) {
      textToSpeak += ` Context: ${currentQuestion.context}`;
    }

    speakText(textToSpeak);
  };

  const speakAnswer = () => {
    const currentAnswer = answers[currentQuestionIndex] || "";
    if (currentAnswer.trim()) {
      speakText(`Your current answer: ${currentAnswer}`);
    } else {
      speakText("You haven't written an answer yet.");
    }
  };

  const speakCompleteAnswer = () => {
    const currentAnswer = answers[currentQuestionIndex] || "";
    if (currentAnswer.trim()) {
      speakText(currentAnswer); // Read just the answer without prefix
    } else {
      speakText("No answer written yet.");
    }
  };

  // Speech-to-Text functionality
  const initializeSpeechRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      // Configure the recognition instance
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";
      recognitionInstance.maxAlternatives = 1;

      // Set a shorter timeout to detect network issues faster
      if (networkStatus === false || isOfflineMode) {
        // In offline or known poor network, use higher timeout
        recognitionInstance.timeout = 10000; // 10 seconds before timing out
      } else {
        recognitionInstance.timeout = 5000; // 5 seconds in normal mode
      }

      let finalTranscript = "";
      let restartAttempts = 0;
      const maxRestartAttempts = 5; // Increased from 3 to 5
      let lastRecognitionTime = Date.now();
      let localBuffer = "";

      recognitionInstance.onstart = () => {
        setIsListening(true);
        restartAttempts = 0; // Reset attempts on successful start
        setSpeechError(null); // Clear any previous errors
        setNetworkRetryCount(0); // Reset network retry count on successful start
        lastRecognitionTime = Date.now();
      };

      recognitionInstance.onresult = (event) => {
        let interimTranscript = "";
        lastRecognitionTime = Date.now(); // Update last successful recognition time

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
            // Clear buffer as we got a final result
            localBuffer = "";
          } else {
            interimTranscript += transcript;
            // Update buffer with latest interim result
            localBuffer = interimTranscript;
          }
        }

        // Update the answer with both final and interim results
        const currentAnswer = answers[currentQuestionIndex] || "";
        const baseAnswer = currentAnswer
          .replace(/\[Speaking...\].*$/, "")
          .trim();

        if (interimTranscript) {
          handleAnswerChange(
            baseAnswer +
              (baseAnswer ? " " : "") +
              finalTranscript +
              interimTranscript +
              " [Speaking...]"
          );
        } else if (finalTranscript.trim()) {
          handleAnswerChange(
            baseAnswer + (baseAnswer ? " " : "") + finalTranscript.trim()
          );
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        // Calculate time since last successful recognition
        const timeSinceLastSuccess = Date.now() - lastRecognitionTime;

        // Handle different types of errors
        switch (event.error) {
          case "network":
            console.log("Network error - check internet connection");

            // If we have local buffer content, use it
            if (localBuffer && localBuffer.trim().length > 0) {
              const currentAnswer = answers[currentQuestionIndex] || "";
              const baseAnswer = currentAnswer
                .replace(/\[Speaking...\].*$/, "")
                .trim();

              // Add the buffered content to the answer
              handleAnswerChange(
                baseAnswer + (baseAnswer ? " " : "") + localBuffer.trim()
              );

              setSpeechError(
                "Limited connectivity - Using locally buffered text."
              );

              // Clear buffer after using it
              localBuffer = "";
            } else {
              setSpeechError(
                "Network connection issue. Using offline mode. Continue speaking."
              );
            }

            setIsOfflineMode(true);
            setIsListening(false);

            // Implement adaptive progressive retry with increased backoff
            if (networkRetryCount < 5) {
              // Increased from 3 to 5
              // Exponential backoff with jitter
              const baseDelay = Math.pow(1.8, networkRetryCount) * 1000; // 1.8s, 3.24s, 5.8s, 10.5s, 18.9s
              const jitter = Math.random() * 1000; // Add up to 1s of jitter
              const retryDelay = baseDelay + jitter;

              // Update the backoff time for display
              setRecognitionBackoffTime(Math.round(retryDelay / 1000));

              setTimeout(() => {
                if (speechToTextEnabled) {
                  console.log(
                    `Retrying speech recognition (attempt ${
                      networkRetryCount + 1
                    })`
                  );
                  setNetworkRetryCount((prev) => prev + 1);
                  setSpeechError(
                    `Retrying connection... (attempt ${
                      networkRetryCount + 1
                    }/5)`
                  );

                  // Try to detect network status
                  if (navigator.onLine) {
                    // Even if browser reports online, use buffer mode
                    setBufferMode(true);
                    startListening();
                  } else {
                    // If definitely offline, wait longer
                    setTimeout(() => startListening(), 3000);
                  }
                }
              }, retryDelay);
            } else {
              // After max retries, switch to manual mode
              setSpeechError(
                "Network connection unstable. Continue typing your answer."
              );
              setBufferMode(true); // Enable buffer mode for future attempts
              setTimeout(() => {
                setSpeechError(null);
              }, 5000);
            }
            break;

          case "no-speech":
            // Don't show an error for no-speech
            setSpeechError(null);

            // Only restart if we're still supposed to be listening and haven't exceeded attempts
            if (restartAttempts < maxRestartAttempts) {
              restartAttempts++;
              setTimeout(() => {
                if (speechToTextEnabled && !isListening) {
                  console.log(
                    `Restarting speech recognition (attempt ${restartAttempts})`
                  );
                  startListening();
                }
              }, 1000);
            }
            break;

          case "audio-capture":
            console.log("Audio capture error - check microphone permissions");
            setSpeechError(
              "Microphone access error. Please check your microphone and permissions."
            );
            break;

          case "not-allowed":
            console.log(
              "Microphone access denied - please allow microphone permission"
            );
            setSpeechError(
              "Microphone access denied. Please allow microphone permission and refresh the page."
            );
            setSpeechToTextEnabled(false);
            break;

          case "service-not-allowed":
            console.log("Speech service not allowed - check browser settings");
            setSpeechError(
              "Speech recognition service blocked. Please check your browser settings."
            );
            setSpeechToTextEnabled(false);
            break;

          case "aborted":
            setSpeechError(null); // Clear error for user-initiated stops
            break;

          default:
            console.log(`Speech recognition error: ${event.error}`);

            // For other errors, try to restart if offline mode is active
            if (isOfflineMode || bufferMode) {
              setSpeechError("Reconnecting speech service...");
              setTimeout(() => {
                if (speechToTextEnabled && !isListening) {
                  startListening();
                }
              }, 2000);
            } else {
              setSpeechError(
                `Speech recognition error: ${event.error}. Please try again.`
              );
            }
        }
      };

      recognitionInstance.onend = () => {
        // Clean up any [Speaking...] indicators
        const currentAnswer = answers[currentQuestionIndex] || "";
        const cleanAnswer = currentAnswer
          .replace(/\[Speaking...\].*$/, "")
          .trim();

        if (cleanAnswer !== currentAnswer) {
          handleAnswerChange(cleanAnswer);
        }

        // Check if we have buffer content to save before stopping
        if (localBuffer && localBuffer.trim().length > 0 && isOfflineMode) {
          const baseAnswer = cleanAnswer;
          handleAnswerChange(
            baseAnswer + (baseAnswer ? " " : "") + localBuffer.trim()
          );
          localBuffer = "";
        }

        // Detect if recognition ended but we should be listening
        // This could happen due to transient issues
        const shouldBeListening = isListening;
        setIsListening(false);

        // Reset final transcript for next session
        finalTranscript = "";

        // If we should be listening but not in a network error state
        // try to restart the recognition
        if (
          shouldBeListening &&
          speechToTextEnabled &&
          !document.hidden && // Don't restart if page is in background
          networkRetryCount < 2
        ) {
          // Only auto-restart for the first few attempts

          // Wait a moment then try to restart
          setTimeout(() => {
            if (speechToTextEnabled && !isListening) {
              console.log("Recognition ended unexpectedly, restarting...");
              startListening();
            }
          }, 300);
        }
      };

      setRecognition(recognitionInstance);
    } else {
      console.log("Speech recognition not supported in this browser");
      setSpeechToTextEnabled(false);
    }
  };

  const startListening = () => {
    if (recognition && speechToTextEnabled && !isListening) {
      try {
        // Check if offline mode should be used
        if (isOfflineMode || !navigator.onLine) {
          setBufferMode(true);
          setSpeechError("Using offline mode with local buffering");
        } else {
          setBufferMode(false);
        }

        // Check if recognition is already running
        if (recognition.state === "listening") {
          recognition.stop();
          setTimeout(() => {
            recognition.start();
          }, 100);
        } else {
          recognition.start();
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsListening(false);

        // If it's already started, just update the state
        if (error.message && error.message.includes("already started")) {
          setIsListening(true);
        } else {
          // For other errors, reinitialize speech recognition
          setTimeout(() => {
            initializeSpeechRecognition();
            setTimeout(() => {
              if (speechToTextEnabled) startListening();
            }, 500);
          }, 1000);
        }
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      try {
        // If we have buffer content, add it to the answer
        if (localBuffer && localBuffer.trim().length > 0) {
          const currentAnswer = answers[currentQuestionIndex] || "";
          const baseAnswer = currentAnswer
            .replace(/\[Speaking...\].*$/, "")
            .trim();

          handleAnswerChange(
            baseAnswer + (baseAnswer ? " " : "") + localBuffer.trim()
          );
          localBuffer = "";
        }

        if (isListening) {
          recognition.stop();
        }
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      } finally {
        setIsListening(false);
        setSpeechError(null);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearAnswer = () => {
    handleAnswerChange("");
    setLastAnswerLength(0);
  };

  // Load voices when component mounts
  useEffect(() => {
    if ("speechSynthesis" in window) {
      loadVoices();
      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    initializeSpeechRecognition();

    // Add network status monitoring
    const handleOnline = () => {
      console.log("Network connection restored");
      setNetworkStatus(true);
      setSpeechError(
        "Network connection restored. Speech recognition available."
      );
      setIsOfflineMode(false);
      setNetworkRetryCount(0);

      // If we were in offline mode, restart recognition
      if (isOfflineMode) {
        setTimeout(() => {
          if (!isListening && speechToTextEnabled) {
            startListening();
          }
        }, 1000);
      }

      // Clear the error message after a moment
      setTimeout(() => {
        setSpeechError(null);
      }, 3000);
    };

    const handleOffline = () => {
      console.log("Network connection lost");
      setNetworkStatus(false);
      setIsOfflineMode(true);
      setSpeechError(
        "Network connection lost. Using offline mode with local buffering."
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initialize network status
    setNetworkStatus(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOfflineMode, isListening, speechToTextEnabled]);

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

  // Auto-read question when it changes
  useEffect(() => {
    if (sessionStarted && !sessionEnded && interview && speechEnabled) {
      const currentQuestion = interview.questions[currentQuestionIndex];
      if (currentQuestion) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          speakText(currentQuestion.question);
        }, 500);
      }
    }
  }, [currentQuestionIndex, sessionStarted, speechEnabled]);

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
      stopSpeaking(); // Stop current speech before moving to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      stopSpeaking(); // Stop current speech before moving to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const endSession = async () => {
    try {
      stopSpeaking(); // Stop any ongoing speech
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

            {/* Voice Settings Panel */}
            {availableVoices.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-3">
                  🎙️ Voice Settings (English Only)
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-blue-800 mb-1">Voice:</label>
                    <select
                      value={speechVoice?.name || ""}
                      onChange={(e) => {
                        const voice = availableVoices.find(
                          (v) => v.name === e.target.value
                        );
                        setSpeechVoice(voice);
                      }}
                      className="w-full text-xs border rounded px-2 py-1"
                    >
                      {availableVoices.map((voice, index) => (
                        <option key={index} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-blue-800 mb-1">
                      Speech Rate:
                    </label>
                    <select
                      value={speechRate}
                      onChange={(e) =>
                        setSpeechRate(parseFloat(e.target.value))
                      }
                      className="w-full text-xs border rounded px-2 py-1"
                    >
                      <option value={0.5}>Very Slow (0.5x)</option>
                      <option value={0.7}>Slow (0.7x)</option>
                      <option value={0.8}>Normal (0.8x)</option>
                      <option value={1.0}>Fast (1x)</option>
                      <option value={1.2}>Faster (1.2x)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center space-x-4 flex-wrap gap-2">
                  <button
                    onClick={() =>
                      speakText(
                        "This is how the voice will sound during your interview. All speech will be in English."
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    🔊 Test Voice
                  </button>
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={autoReadAnswer}
                      onChange={(e) => setAutoReadAnswer(e.target.checked)}
                      className="rounded"
                    />
                    <span>Auto-read answers</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={speechToTextEnabled}
                      onChange={(e) => setSpeechToTextEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Enable speech-to-text</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={bufferMode}
                      onChange={(e) => {
                        setBufferMode(e.target.checked);
                        if (e.target.checked) {
                          setSpeechError(
                            "Buffer mode enabled for low bandwidth connections"
                          );
                          setTimeout(() => setSpeechError(null), 3000);
                        }
                      }}
                      className="rounded"
                    />
                    <span title="Enable this for unstable internet connections">
                      Low bandwidth mode
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">
                Interview Tips:
              </h3>
              <ul className="text-blue-800 text-sm text-left list-disc list-inside space-y-1">
                <li>Questions will be read aloud automatically in English</li>
                <li>
                  You can speak your answers - they'll be converted to text
                </li>
                <li>Use the microphone button to start/stop voice input</li>
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
                  <label className="block text-sm font-medium text-gray-700">
                    Your Answer:{" "}
                    {isListening && (
                      <span className="text-green-600 animate-pulse">
                        🎙️ Listening...
                      </span>
                    )}
                  </label>
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
                    onClick={toggleListening}
                    disabled={!speechToTextEnabled}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isListening
                        ? "bg-red-600 text-white hover:bg-red-700 animate-pulse"
                        : speechToTextEnabled
                        ? isOfflineMode
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {isListening ? (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></div>
                        Stop Speaking
                      </>
                    ) : (
                      <>
                        🎙️{" "}
                        {isOfflineMode
                          ? "Start Speaking (Offline Mode)"
                          : "Start Speaking"}
                      </>
                    )}
                  </button>

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
                  placeholder={
                    speechToTextEnabled
                      ? "Click 'Start Speaking' to speak your answer, or type here manually..."
                      : "Type your answer here... Enable speech-to-text in settings to speak your answers."
                  }
                />

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-xs text-gray-500">
                      💡{" "}
                      {isListening
                        ? "Speak clearly - your words are being converted to text"
                        : speechToTextEnabled
                        ? "Click the microphone to speak your answer"
                        : "Type your answer or re-enable speech-to-text"}
                    </p>
                    {isSpeaking && (
                      <span className="text-xs text-blue-600 animate-pulse">
                        🔊 Speaking...
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
