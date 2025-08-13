// Server-side implementation of the Whisper model
const { pipeline } = require("@huggingface/transformers");

// Model configuration - using the English-optimized tiny model (50MB size)
const MODEL_NAME = "Xenova/whisper-tiny.en";

// Singleton to keep the model loaded
let transcriber = null;

/**
 * Initialize the speech-to-text model
 * @returns {Promise<Object>} The loaded pipeline
 */
async function initSpeechToText() {
  if (!transcriber) {
    try {
      console.log("Loading Whisper tiny.en model...");
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
 * @param {Buffer|string} audioData - The audio data or URL to transcribe
 * @param {Object} options - Options for transcription
 * @returns {Promise<string>} The transcribed text
 */
async function transcribeAudio(audioData, options = {}) {
  try {
    // Make sure model is initialized
    const model = await initSpeechToText();

    // Prepare transcription options
    const transcriptionOptions = {
      language: "en",
      task: "transcribe",
      return_timestamps: options.returnTimestamps || false,
    };

    // Transcribe the audio
    const result = await model(audioData, transcriptionOptions);

    console.log("Transcription completed successfully");
    return result.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Transcribe audio with word-level timestamps
 * @param {Buffer|string} audioData - The audio data or URL to transcribe
 * @returns {Promise<Object>} The transcribed text with word-level timestamps
 */
async function transcribeWithWordTimestamps(audioData) {
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

module.exports = {
  transcribeAudio,
  transcribeWithWordTimestamps,
  initSpeechToText,
};
