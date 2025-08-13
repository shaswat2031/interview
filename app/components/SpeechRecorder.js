"use client";

import React, { useState, useEffect } from "react";
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

const SpeechRecorder = ({ onTranscriptionComplete, isDisabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [recordingController, setRecordingController] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState(null);

  // Check if speech to text is supported
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const speechModule = await loadSpeechRecognition();
        if (speechModule) {
          setIsSupported(speechModule.isSpeechToTextSupported());
        } else {
          setIsSupported(false);
        }
      } catch (error) {
        console.error("Error checking speech support:", error);
        setIsSupported(false);
      }
    };

    if (isBrowser()) {
      checkSupport();
    } else {
      setIsSupported(false);
    }
  }, []);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    } else if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [isRecording]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startRecording = async () => {
    if (isRecording || isDisabled) return;

    setError(null);
    setIsRecording(true);
    setRecordingTime(0);

    try {
      // Dynamically load the speech recognition module
      const speechModule = await loadSpeechRecognition();

      if (!speechModule) {
        throw new Error("Failed to load speech recognition module");
      }

      const controller = speechModule.startRecordingWithTranscription({
        maxDuration: 60000, // 1 minute max
        onRecordingStart: () => {
          console.log("Recording started");
        },
        onRecordingStop: () => {
          setIsRecording(false);
          setIsProcessing(true);
        },
        onTranscriptionComplete: (text) => {
          console.log("Transcription complete:", text);
          setIsProcessing(false);
          if (onTranscriptionComplete) {
            onTranscriptionComplete(text);
          }
        },
        onError: (error) => {
          console.error("Recording error:", error);
          setError("Error processing speech: " + error.message);
          setIsRecording(false);
          setIsProcessing(false);
        },
      });

      setRecordingController(controller);
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Error starting recording: " + error.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !recordingController) return;
    recordingController.stop();
  };

  if (!isSupported) {
    return (
      <div className="text-red-500 text-sm mb-2">
        Speech recognition is not supported in this browser.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isDisabled || isProcessing}
          className={`px-4 py-2 rounded-full flex items-center ${
            isRecording
              ? "bg-red-500 text-white hover:bg-red-600"
              : isProcessing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isRecording ? (
            <>
              <span className="animate-pulse mr-2">●</span> Stop Recording (
              {formatTime(recordingTime)})
            </>
          ) : isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
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
              Processing...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
              Record Answer
            </>
          )}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

      {isProcessing && (
        <div className="text-blue-500 text-sm mt-2 animate-pulse">
          Transcribing your speech with Whisper AI...
        </div>
      )}
    </div>
  );
};

export default SpeechRecorder;
