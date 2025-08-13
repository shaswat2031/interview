// MongoDB connection for Netlify functions
const mongoose = require("mongoose");
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Get MongoDB connection string from environment variables
  const mongoUri = process.env.mongodb_uri;

  if (!mongoUri) {
    throw new Error("mongodb_uri environment variable is not defined");
  }

  // Connect to MongoDB
  const client = await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = client;
  return client;
}

exports.handler = async (event, context) => {
  // Make sure we don't keep the connection alive
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to the database
    const client = await connectToDatabase();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully connected to MongoDB",
        isConnected: client.connection.readyState === 1, // 1 = connected
        timestamp: new Date().toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Database connection failed",
        details: error.message,
      }),
    };
  }
};
