import { Router } from "express";
import mongoose from "mongoose";
import { exec } from "child_process";
import { promisify } from "util";

const router = Router();
const execAsync = promisify(exec);

// Health check for database
router.get("/db-health", async (_req, res) => {
    // Check NODE_ENV
    if (process.env.NODE_ENV !== "development") {
        return res.status(403).json({
            success: false,
            message: "This action is not allowed in production"
        });
    }
    
    try {
        const dbStatus = mongoose.connection.readyState;
        const statusMap: Record<number, string> = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };
        
        res.status(200).json({
            success: true,
            database: statusMap[dbStatus] || "unknown",
            collections: await mongoose.connection.db?.listCollections().toArray()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get database health",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Minecraft Server Control Routes
const MINECRAFT_SERVICE = process.env.MINECRAFT_SERVICE || 'minecraft';

// Check if Minecraft server is running
router.get("/server/status", async (_req, res) => {
    try {
        // Check if service is active
        try {
            await execAsync(`systemctl is-active --quiet ${MINECRAFT_SERVICE}`);
            res.status(200).json({ success: true, running: true, message: "Server is running" });
        } catch {
            // Service is not active
            res.status(200).json({ success: true, running: false, message: "Server is stopped" });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// Start Minecraft server
router.post("/server/start", async (_req, res) => {
    try {
        await execAsync(`sudo systemctl start ${MINECRAFT_SERVICE}`);
        res.status(200).json({ success: true, message: "Server start command sent" });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to start server"
        });
    }
});

// Stop Minecraft server
router.post("/server/stop", async (_req, res) => {
    try {
        await execAsync(`sudo systemctl stop ${MINECRAFT_SERVICE}`);
        res.status(200).json({ success: true, message: "Server stop command sent" });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to stop server"
        });
    }
});

// Restart Minecraft server
router.post("/server/restart", async (_req, res) => {
    try {
        await execAsync(`sudo systemctl restart ${MINECRAFT_SERVICE}`);
        res.status(200).json({ success: true, message: "Server restart command sent" });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to restart server"
        });
    }
});

export default router;