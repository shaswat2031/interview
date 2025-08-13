"use client";

// Dynamically import the transformers library to reduce initial bundle size
let transformersPromise = null;

const getTransformers = async () => {
  if (!transformersPromise) {
    transformersPromise = import("@huggingface/transformers");
  }
  return await transformersPromise;
};

// Model configuration - using the English-optimized tiny model for faster performance
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
      console.log("Loading Whisper model...");
      const transformers = await getTransformers();
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
 * @param {Object} options - Options for transcription
 * @returns {Promise<string>} The transcribed text
 */
export async function transcribeAudio(audioData, options = {}) {
  try {
    // Make sure model is initialized
    const model = await initSpeechToText();
    const transformers = await getTransformers();

    // Convert the Blob to a format that the model can understand
    // Create a URL from the Blob
    const audioUrl = URL.createObjectURL(audioData);

    // Use transformers.read_audio to convert to the expected format (Float32Array)
    // Default sampling rate for Whisper is 16000
    const audioArray = await transformers.read_audio(audioUrl, 16000);
    // Revoke the URL to free up memory
    URL.revokeObjectURL(audioUrl);

    // Setup transcription options
    const transcriptionOptions = {
      // Use English as the forced language for better accuracy
      language: "en",
      // Set task to transcribe for general transcription
      task: "transcribe",
      // Return word-level timestamps if requested
      return_timestamps: options.returnWordTimestamps || false,
      // Chunk size in seconds for faster processing
      chunk_length_s: options.chunkLengthSeconds || 30,
      // Stride between chunks for overlap processing
      stride_length_s: options.strideLengthSeconds || 5,
    };

    // Transcribe the audio with optimized settings
    const output = await model(audioArray, transcriptionOptions);

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
          // Transcribe the recorded audio with options
          const transcriptionOptions = {
            // Default to false for word timestamps
            returnWordTimestamps: false,
            // Use smaller chunks for faster real-time processing
            chunkLengthSeconds: 15,
            strideLengthSeconds: 3,
          };
          const transcription = await transcribeAudio(
            audioBlob,
            transcriptionOptions
          );
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

/**
 * Transcribe audio with word-level timestamps
 * @param {File|Blob} audioData - The audio data to transcribe
 * @returns {Promise<Object>} The transcribed text with timestamps
 */
export async function transcribeAudioWithTimestamps(audioData) {
  try {
    // Use the same transcribeAudio function but with word timestamps enabled
    const options = {
      returnWordTimestamps: true,
      chunkLengthSeconds: 30,
      strideLengthSeconds: 5,
    };

    // Make sure model is initialized
    const model = await initSpeechToText();
    const transformers = await getTransformers();

    // Convert the Blob to a format that the model can understand
    const audioUrl = URL.createObjectURL(audioData);
    const audioArray = await transformers.read_audio(audioUrl, 16000);
    URL.revokeObjectURL(audioUrl);

    // Transcribe with timestamps
    const transcriptionOptions = {
      language: "en",
      task: "transcribe",
      return_timestamps: "word",
      chunk_length_s: options.chunkLengthSeconds,
      stride_length_s: options.strideLengthSeconds,
    };

    const output = await model(audioArray, transcriptionOptions);

    // Return the full output which includes text and word chunks with timestamps
    return output;
  } catch (error) {
    console.error("Error transcribing audio with timestamps:", error);
    throw error;
  }
}
