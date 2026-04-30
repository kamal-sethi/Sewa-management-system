// lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

/**
 * Global cache to prevent multiple connections in development
 * (Next.js hot-reloads can cause multiple connections otherwise)
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, dbName: null };
}

export async function connectDB(dbName = "test") {
  if (cached.conn && cached.dbName === dbName) {
    return cached.conn;
  }

  // If the requested DB changed, reconnect the default mongoose connection
  // so model queries run against the correct database for this session.
  if (cached.conn && cached.dbName !== dbName) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    cached.dbName = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName,
    });
  }

  cached.conn = await cached.promise;
  cached.dbName = dbName;
  return cached.conn;
}
