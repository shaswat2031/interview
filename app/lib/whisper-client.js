"use client";

import * as transformers from "@huggingface/transformers";

// Model configuration
const MODEL_NAME = "Xenova/whisper-small";

// Singleton to keep the model loaded
let transcriber = null;

/**
 * Initialize the speech-to-text model
 * @returns {Promise<Object>} The loaded pipeline
 */
export async function initSpeechToText() {
  if (!transcriber) {
    try {
      console.log("Loading Whisper model...");
      transcriber = await transformers.pipeline(
        "automatic-speech-recognition",
        MODEL_NAME
      );
      console.log("Whisper model loaded successfully");
    } catch (error) {
      console.error("Error loading Whisper model:", error);
      throw error;
    }
  }
  return transcriber;
}

/**
 * Transcribe audio from a file or blob
 * @param {File|Blob} audioData - The audio data to transcribe
 * @returns {Promise<string>} The transcribed text
 */
export async function transcribeAudio(audioData) {
  try {
    // Make sure model is initialized
    const model = await initSpeechToText();

    // Convert the Blob to a format that the model can understand
    // Create a URL from the Blob
    const audioUrl = URL.createObjectURL(audioData);

    // Use transformers.read_audio to convert to the expected format (Float32Array)
    // Default sampling rate for Whisper is 16000
    const audioArray = await transformers.read_audio(audioUrl, 16000);

    // Revoke the URL to free up memory
    URL.revokeObjectURL(audioUrl);

    // Transcribe the audio with the processed data
    const output = await model(audioArray);

    return output.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Record audio and transcribe it
 * @param {number} maxDuration - Maximum recording duration in milliseconds
 * @param {Function} onTranscriptionComplete - Callback with transcribed text
 * @param {Function} onRecordingStart - Callback when recording starts
 * @param {Function} onRecordingStop - Callback when recording stops
 * @param {Function} onError - Callback for errors
 * @returns {Object} Controller with stop function
 */
export function startRecordingWithTranscription({
  maxDuration = 30000,
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
}) {
  let mediaRecorder = null;
  let audioChunks = [];
  let recordingTimeout = null;

  // Get user media
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      // Create media recorder
      mediaRecorder = new MediaRecorder(stream);

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstart = () => {
        audioChunks = [];
        if (onRecordingStart) onRecordingStart();

        // Set timeout for max duration
        if (maxDuration > 0) {
          recordingTimeout = setTimeout(() => {
            stopRecording();
          }, maxDuration);
        }
      };

      mediaRecorder.onstop = async () => {
        if (recordingTimeout) {
          clearTimeout(recordingTimeout);
          recordingTimeout = null;
        }

        if (onRecordingStop) onRecordingStop();

        // Convert recorded chunks to blob
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

        try {
          // Transcribe the recorded audio
          const transcription = await transcribeAudio(audioBlob);
          if (onTranscriptionComplete) onTranscriptionComplete(transcription);
        } catch (error) {
          if (onError) onError(error);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start();
    })
    .catch((error) => {
      console.error("Error accessing microphone:", error);
      if (onError) onError(error);
    });

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  // Return controller
  return {
    stop: stopRecording,
  };
}

/**
 * Check if the browser supports the required APIs
 * @returns {boolean} True if supported
 */
export function isSpeechToTextSupported() {
  try {
    return (
      typeof window !== "undefined" &&
      navigator &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof window.MediaRecorder === "function"
    );
  } catch (error) {
    console.error("Error checking speech support:", error);
    return false;
  }
}
