export function validateEnvVars() {
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "GEMINI_API_KEY",
    "NEXTAUTH_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return true;
}

export function getEnvVar(key, defaultValue = null) {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue;
}
