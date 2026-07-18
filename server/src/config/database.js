import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  try {
    mongoose.set("strictQuery", true);

    const connection = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5_000,
    });

    console.log(`MongoDB đã kết nối: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    throw new Error(`Không thể kết nối MongoDB: ${error.message}`, {
      cause: error,
    });
  }
}

export async function disconnectDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB đã ngắt kết nối.");
    }
  } catch (error) {
    throw new Error(`Không thể ngắt kết nối MongoDB: ${error.message}`, {
      cause: error,
    });
  }
}
