export function validateEnvVars() {
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "GEMINI_API_KEY",
    "NEXTAUTH_SECRET",
  ];

  const missing = required.filter((key) => {
    const value = process.env[key];
    return !value || value.trim() === "";
  });

  if (missing.length > 0) {
    console.error(
      `Missing or empty environment variables: ${missing.join(", ")}`
    );
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Additional validation for MongoDB URI format
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.startsWith("mongodb")) {
    console.error(
      'MONGODB_URI has invalid format. Should start with "mongodb" or "mongodb+srv"'
    );
    throw new Error("MONGODB_URI has invalid format");
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
