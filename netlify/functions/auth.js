// Authentication function for Netlify
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const verifyToken = (authHeader) => {
  if (!authHeader) {
    throw new Error("Authorization header is required");
  }

  // Extract the token from the Authorization header
  // Authorization: Bearer <token>
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("Token not provided");
  }

  try {
    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token: " + error.message);
  }
};

exports.handler = async (event, context) => {
  try {
    // Check for Authorization header
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    // Verify the token
    const user = verifyToken(authHeader);

    return {
      statusCode: 200,
      body: JSON.stringify({
        authenticated: true,
        user,
        timestamp: new Date().toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      statusCode: 401,
      body: JSON.stringify({
        authenticated: false,
        error: error.message,
      }),
    };
  }
};
