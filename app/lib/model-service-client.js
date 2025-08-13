"use client";

const MODEL_SERVICE_URL = "https://interview-service-o116.onrender.com";

/**
 * Client for interacting with the Model Service API
 */
export default class ModelServiceClient {
  /**
   * Generate text using the Gemini model
   * @param {string} prompt - The prompt to send to the model
   * @returns {Promise<string>} The generated text
   */
  static async generateText(prompt) {
    try {
      const response = await fetch(`${MODEL_SERVICE_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate text");
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  }

  /**
   * Transcribe audio using the Whisper model
   * @param {Blob} audioBlob - The audio blob to transcribe
   * @returns {Promise<string>} The transcribed text
   */
  static async transcribeAudio(audioBlob) {
    try {
      // Convert the blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      const response = await fetch(`${MODEL_SERVICE_URL}/api/transcribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioData: base64Audio }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to transcribe audio");
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  }

  /**
   * Check if the model service is available
   * @returns {Promise<boolean>} Whether the service is available
   */
  static async isAvailable() {
    try {
      const response = await fetch(`${MODEL_SERVICE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error("Model service is not available:", error);
      return false;
    }
  }
}

/**
 * Convert a Blob to a base64 string
 * @param {Blob} blob - The blob to convert
 * @returns {Promise<string>} The base64 string
 */
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
