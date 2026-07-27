import mongoose from "mongoose";

function normalizeMongoUri(rawValue) {
  if (!rawValue) return "";

  let uri = rawValue.trim();

  // Handle accidental paste of the full key-value line into env value.
  if (uri.startsWith("MONGODB_URI=")) {
    uri = uri.slice("MONGODB_URI=".length).trim();
  }

  // Handle values wrapped in quotes.
  const hasDoubleQuotes = uri.startsWith('"') && uri.endsWith('"');
  const hasSingleQuotes = uri.startsWith("'") && uri.endsWith("'");
  if (hasDoubleQuotes || hasSingleQuotes) {
    uri = uri.slice(1, -1).trim();
  }

  return uri;
}

const MONGODB_URI = normalizeMongoUri(process.env.MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

if (!/^mongodb(\+srv)?:\/\//.test(MONGODB_URI)) {
  throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://");
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
