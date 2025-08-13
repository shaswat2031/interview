// Function to get interviews from MongoDB
const mongoose = require("mongoose");
let cachedDb = null;

// Define the Interview schema
const interviewSchema = new mongoose.Schema({
  userId: String,
  jobTitle: String,
  companyName: String,
  interviewType: String,
  difficultyLevel: String,
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  questions: [
    {
      question: String,
      answer: String,
      feedback: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return;
  }

  // Get MongoDB connection string from environment variables
  const mongoUri = process.env.mongodb_uri;

  if (!mongoUri) {
    throw new Error("mongodb_uri environment variable is not defined");
  }

  // Connect to MongoDB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = mongoose;
}

exports.handler = async (event, context) => {
  // Make sure we don't keep the connection alive
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to the database
    await connectToDatabase();

    // Initialize the Interview model
    const Interview =
      mongoose.models.Interview || mongoose.model("Interview", interviewSchema);

    // Check if we have a userId query parameter
    const params = event.queryStringParameters;
    const userId = params?.userId;

    let query = {};
    if (userId) {
      query.userId = userId;
    }

    // Get the interviews from the database
    const interviews = await Interview.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        interviews,
        count: interviews.length,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Failed to fetch interviews",
        details: error.message,
      }),
    };
  }
};
