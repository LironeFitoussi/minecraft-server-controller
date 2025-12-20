import { Router } from "express";
import mongoose from "mongoose";
import { exec } from "child_process";
import { promisify } from "util";
import * as os from "os";

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

// System Stats Routes
router.get("/stats/system", async (_req, res) => {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePercent = (usedMem / totalMem) * 100;

        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || "Unknown";
        const cpuCount = cpus.length;

        // Get CPU usage (simplified - average of all cores)
        const cpuUsage = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            const idle = cpu.times.idle;
            return acc + (1 - idle / total);
        }, 0) / cpuCount * 100;

        // Get disk usage
        let diskUsage = { total: 0, used: 0, free: 0, percent: 0 };
        try {
            const { stdout } = await execAsync("df -BG / | tail -1");
            const parts = stdout.trim().split(/\s+/);
            // df output: Filesystem 1G-blocks Used Available Use% Mounted
            if (parts.length >= 5) {
                const totalGB = parseFloat(parts[1] || '0');
                const usedGB = parseFloat(parts[2] || '0');
                const freeGB = parseFloat(parts[3] || '0');
                const percentStr = parts[4] || '0%';
                const percent = parseFloat(percentStr.replace('%', '')) || 0;
                
                diskUsage = {
                    total: totalGB,
                    used: usedGB,
                    free: freeGB,
                    percent: percent
                };
            }
        } catch {
            // Fallback if df command fails - try alternative
            try {
                const { stdout } = await execAsync("df -h / | tail -1");
                const parts = stdout.trim().split(/\s+/);
                if (parts.length >= 5) {
                    // Parse human-readable format (e.g., "100G", "50G")
                    const parseSize = (size: string | undefined): number => {
                        if (!size) return 0;
                        const match = size.match(/(\d+\.?\d*)([KMGT])/);
                        if (!match || !match[1] || !match[2]) return 0;
                        const value = parseFloat(match[1]);
                        const unit = match[2];
                        const multipliers: Record<string, number> = { K: 0.000001, M: 0.001, G: 1, T: 1000 };
                        return value * (multipliers[unit] || 1);
                    };
                    
                    const percentStr = parts[4] || '0%';
                    diskUsage = {
                        total: parseSize(parts[1]),
                        used: parseSize(parts[2]),
                        free: parseSize(parts[3]),
                        percent: parseFloat(percentStr.replace('%', '')) || 0
                    };
                }
            } catch {
                // Keep default values
            }
        }

        // Get network stats
        const networkInterfaces = os.networkInterfaces();
        const networkStats: any = {};
        Object.keys(networkInterfaces).forEach((iface) => {
            const addresses = networkInterfaces[iface];
            if (addresses) {
                networkStats[iface] = addresses.map(addr => ({
                    address: addr.address,
                    netmask: addr.netmask,
                    family: addr.family,
                    mac: addr.mac,
                    internal: addr.internal
                }));
            }
        });

        // Get uptime
        const uptime = os.uptime();
        const uptimeDays = Math.floor(uptime / 86400);
        const uptimeHours = Math.floor((uptime % 86400) / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);

        // Get load average
        const loadAvg = os.loadavg();

        res.status(200).json({
            success: true,
            data: {
                cpu: {
                    model: cpuModel,
                    cores: cpuCount,
                    usage: Math.round(cpuUsage * 100) / 100,
                    loadAverage: loadAvg
                },
                memory: {
                    total: totalMem,
                    used: usedMem,
                    free: freeMem,
                    usagePercent: Math.round(memUsagePercent * 100) / 100
                },
                disk: diskUsage,
                network: networkStats,
                system: {
                    platform: os.platform(),
                    arch: os.arch(),
                    hostname: os.hostname(),
                    uptime: {
                        total: uptime,
                        days: uptimeDays,
                        hours: uptimeHours,
                        minutes: uptimeMinutes,
                        formatted: `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`
                    },
                    nodeVersion: process.version
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to get system stats"
        });
    }
});

export default router;