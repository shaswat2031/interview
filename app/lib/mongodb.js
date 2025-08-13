// lib/dbConnect.js
import mongoose from "mongoose";

const mongodb_uri =
  "mongodb+srv://prasadshaswat9265:prasadshaswat9265@cluster0.atgekgj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!mongodb_uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable " +
      "inside .env.local (for local) and in Vercel Environment Variables (for production)."
  );
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
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
