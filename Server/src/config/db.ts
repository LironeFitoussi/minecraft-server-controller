import mongoose from "mongoose";

export default async function connectDB() {
    // MongoDB is optional - only connect if MONGO_URI is provided
    if (!process.env.MONGO_URI) {
        console.log("⚠️  MONGO_URI not set - skipping database connection");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        // Don't exit - allow server to run without DB
        console.log("⚠️  Continuing without database...");
    }
}