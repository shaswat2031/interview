"use client";

/**
 * This file contains utility functions to check if the current environment is the browser.
 * Used to ensure browser-only code doesn't execute on the server.
 */

/**
 * Check if the current environment is a browser
 * @returns {boolean} True if running in a browser environment
 */
export function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Check if the Audio API is available
 * @returns {boolean} True if Audio API is available
 */
export function isAudioSupported() {
  return isBrowser() && typeof window.AudioContext !== "undefined";
}

/**
 * Check if the MediaRecorder API is available
 * @returns {boolean} True if MediaRecorder API is available
 */
export function isMediaRecorderSupported() {
  return (
    isBrowser() &&
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices !== "undefined" &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof window.MediaRecorder === "function"
  );
}
