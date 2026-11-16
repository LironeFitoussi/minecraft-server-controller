// Load .env before any other module reads process.env
import "dotenv/config";

// Modules imports
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Config
import { errorHandler } from "./utils/errorHandler.js";

// Routes
import dangerRoutes from "./routes/dangerRoutes.js";
import minecraftRoutes from "./routes/minecraft.routes.js";

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Initialize express app
const app = express();
// Behind nginx: use X-Forwarded-For for the client IP (needed by the rate limiter)
app.set("trust proxy", "loopback");
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;


if (!PORT) {
    throw new Error("PORT is not set");
} 

// Cors - Allow both dev (5173) and production (80)
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }
        
        // Allow localhost on any port for development
        if (origin.startsWith('http://localhost:') || origin === 'http://localhost') {
            return callback(null, true);
        }
        
        // Allow from environment variable
        if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
            return callback(null, true);
        }
        
        // Allow all for development (can restrict in production)
        callback(null, true);
    },
    credentials: true,
}));

// Rate Limit 
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10000, // requests per 15 minutes (the dashboard polls every few seconds)
}));

// Morgan 
app.use(morgan("dev")); // dev is the format of the logs

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (req, res) => {
    res.json({ success: true, message: "Server is healthy" });
});

// Test endpoint to verify API connectivity
app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "API is working", timestamp: new Date().toISOString() });
});

app.use("/api/minecraft", minecraftRoutes);
app.use("/danger", dangerRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(parseInt(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/minecraft`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});