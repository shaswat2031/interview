import mongoose from "mongoose";
import { MongoClient } from "mongodb";

// Get MongoDB URI from environment variables, with better error messages for deployment
const MONGODB_URI =
  "mongodb+srv://prasadshaswat9265:prasadshaswat9265@cluster0.atgekgj.mongodb.net/interviewai?retryWrites=true&w=majority";
// Don't throw during module initialization - defer to connection time to allow for better debugging
if (!MONGODB_URI) {
  console.error("mongodb_uri environment variable is not defined!");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Check for MongoDB URI here, with a clearer error message
    if (!MONGODB_URI) {
      throw new Error(
        "MongoDB connection failed: mongodb_uri environment variable is not defined. Please check your Vercel environment variables."
      );
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout for deployment
      socketTimeoutMS: 60000, // Increased timeout for deployment
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Connected to MongoDB");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    console.error("Connection error details:", {
      message: e.message,
      code: e.code,
      name: e.name,
    });
    throw new Error(`Failed to connect to MongoDB: ${e.message}`);
  }

  return cached.conn;
}

// MongoDB native client connection for API routes
let cachedClient = global.mongo;

if (!cachedClient) {
  cachedClient = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cachedClient.conn) {
    return cachedClient.conn;
  }

  if (!cachedClient.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cachedClient.promise = MongoClient.connect(MONGODB_URI, opts).then(
      (client) => {
        return {
          client,
          db: client.db(),
        };
      }
    );
  }

  try {
    cachedClient.conn = await cachedClient.promise;
  } catch (e) {
    cachedClient.promise = null;
    throw e;
  }

  return cachedClient.conn;
}

export default dbConnect;
