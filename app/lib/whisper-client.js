"use client";

// Import pipeline dynamically from transformers.js to reduce initial bundle size
let pipelinePromise = null;

/**
 * Dynamically imports the pipeline function from transformers.js
 * @returns {Promise<Function>} The pipeline function
 */
const getPipeline = async () => {
  // Only load in browser environment
  if (typeof window === "undefined") {
    throw new Error(
      "Speech recognition is only available in browser environments"
    );
  }

  if (!pipelinePromise) {
    // Dynamic import will be code-split and only loaded when needed
    pipelinePromise = import("@huggingface/transformers").then(
      (module) => module.pipeline
    );
  }
  return await pipelinePromise;
};

// Model configuration - using the English-optimized tiny model (50MB size)
const MODEL_NAME = "Xenova/whisper-tiny.en";

// Singleton to keep the model loaded
let transcriber = null;

/**
 * Initialize the speech-to-text model
 * @returns {Promise<Object>} The loaded pipeline
 */
export async function initSpeechToText() {
  if (!transcriber) {
    try {
      console.log("Loading Whisper tiny.en model...");
      const pipeline = await getPipeline();
      transcriber = await pipeline("automatic-speech-recognition", MODEL_NAME);
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
 * @param {File|Blob|string} audioData - The audio data or URL to transcribe
 * @param {Object} options - Options for transcription
 * @returns {Promise<Object>} The transcribed text and optional timestamps
 */
export async function transcribeAudio(audioData, options = {}) {
  try {
    // Make sure model is initialized
    const model = await initSpeechToText();

    // Prepare transcription options
    const transcriptionOptions = {
      language: "en",
      task: "transcribe",
      return_timestamps: options.returnTimestamps || false,
    };

    // Transcribe the audio - the model automatically handles Blob, File, URL, or ArrayBuffer
    const result = await model(audioData, transcriptionOptions);

    console.log("Transcription completed:", result);
    return result.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Transcribe audio with word-level timestamps
 * @param {File|Blob|string} audioData - The audio data or URL to transcribe
 * @returns {Promise<Object>} The transcribed text with word-level timestamps
 */
export async function transcribeWithWordTimestamps(audioData) {
  try {
    // Make sure model is initialized
    const model = await initSpeechToText();

    // Transcribe with word-level timestamps
    const result = await model(audioData, {
      language: "en",
      task: "transcribe",
      return_timestamps: "word",
    });

    return result;
  } catch (error) {
    console.error("Error transcribing with timestamps:", error);
    throw error;
  }
}

/**
 * Record audio and transcribe it
 * @param {Object} options - Recording options
 * @returns {Object} Controller with stop function
 */
export function startRecordingWithTranscription({
  maxDuration = 30000,
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
}) {
  // Verify browser support
  if (
    typeof window === "undefined" ||
    !navigator.mediaDevices ||
    !window.MediaRecorder
  ) {
    if (onError)
      onError(new Error("MediaRecorder API not supported in this browser"));
    return { stop: () => {} };
  }

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
          // Use simplified transcribeAudio function directly
          const transcription = await transcribeAudio(audioBlob, {
            returnTimestamps: false,
          });
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
    // Only load in browser environment
    if (typeof window === "undefined") {
      return false;
    }

    return (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof window.MediaRecorder === "function"
    );
  } catch (error) {
    console.error("Error checking speech support:", error);
    return false;
  }
}
/**
 * Transcribe audio with word-level timestamps
 * @param {File|Blob|string} audioData - The audio data or URL to transcribe
 * @returns {Promise<Object>} The transcribed text with word-level timestamps
 */
export async function transcribeAudioWithTimestamps(audioData) {
  try {
    // Make sure model is initialized
    const model = await initSpeechToText();

    // Transcribe with word-level timestamps
    const result = await model(audioData, {
      language: "en",
      task: "transcribe",
      return_timestamps: "word",
    });

    return result;
  } catch (error) {
    console.error("Error transcribing with timestamps:", error);
    throw error;
  }
}
