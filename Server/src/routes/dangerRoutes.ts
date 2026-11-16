import { Router } from "express";
import mongoose from "mongoose";
import { exec, execFile } from "child_process";
import { promisify } from "util";
import * as os from "os";

const router = Router();
const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

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
// Read lazily so the value from .env is used
const getMinecraftService = (): string => {
    const service = process.env.MINECRAFT_SERVICE || 'minecraft';
    if (!/^[\w@.:-]+$/.test(service)) {
        throw new Error(`Invalid MINECRAFT_SERVICE name: ${service}`);
    }
    return service;
};

// Current systemd state: active, activating, deactivating, inactive, failed...
const getServiceState = async (): Promise<string> => {
    try {
        const { stdout } = await execFileAsync('systemctl', ['is-active', getMinecraftService()], { timeout: 5000 });
        return stdout.trim() || 'unknown';
    } catch (error) {
        // is-active exits non-zero for anything but "active", but still prints the state
        const stdout = (error as { stdout?: string }).stdout?.trim();
        if (stdout) return stdout;
        throw error;
    }
};

// Run "sudo systemctl <action> <service>" without holding the HTTP request open.
// systemctl waits until the service has fully started/stopped (a Minecraft
// shutdown can take over a minute), so we only wait briefly to catch immediate
// failures such as missing sudo permissions, then let it finish in the background.
// "sudo -n" fails right away instead of waiting for a password prompt.
const EARLY_FAILURE_WINDOW_MS = 3000;
const controlService = async (action: 'start' | 'stop' | 'restart'): Promise<void> => {
    const describe = (error: unknown): Error => {
        const stderr = (error as { stderr?: string }).stderr?.trim();
        if (stderr && /password is required|no new privileges|not allowed|not in the sudoers/i.test(stderr)) {
            return new Error(
                `Not permitted to ${action} the Minecraft service. Allow passwordless sudo for systemctl (see SETUP_STARTUP.md). Details: ${stderr}`
            );
        }
        return new Error(stderr || (error instanceof Error ? error.message : `Failed to ${action} server`));
    };

    const command = execFileAsync('sudo', ['-n', 'systemctl', action, getMinecraftService()], { timeout: 5 * 60 * 1000 });
    let responded = false;
    const finished = command.then(
        () => {},
        (error) => {
            if (responded) {
                console.error(`❌ systemctl ${action} failed:`, describe(error).message);
                return;
            }
            throw describe(error);
        }
    );
    await Promise.race([finished, new Promise((resolve) => setTimeout(resolve, EARLY_FAILURE_WINDOW_MS))]);
    responded = true;
};

// Check if Minecraft server is running
router.get("/server/status", async (_req, res) => {
    try {
        const state = await getServiceState();
        // "running" stays true while stopping so the UI doesn't offer Start mid-shutdown
        const running = state === 'active' || state === 'activating' || state === 'deactivating' || state === 'reloading';
        res.status(200).json({ success: true, running, state, message: `Server is ${state}` });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

(['start', 'stop', 'restart'] as const).forEach((action) => {
    router.post(`/server/${action}`, async (_req, res) => {
        try {
            await controlService(action);
            res.status(200).json({ success: true, message: `Server ${action} command sent` });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : `Failed to ${action} server`
            });
        }
    });
});

// CPU usage over the interval since the previous sample.
// (os.cpus() times are totals since boot, so a single reading barely ever changes.)
type CpuSample = { idle: number; total: number };
const sampleCpu = (): CpuSample => {
    let idle = 0;
    let total = 0;
    for (const cpu of os.cpus()) {
        idle += cpu.times.idle;
        total += Object.values(cpu.times).reduce((a, b) => a + b, 0);
    }
    return { idle, total };
};
let lastCpuSample = sampleCpu();
let lastCpuUsage = 0;
const getCpuUsage = (): number => {
    const current = sampleCpu();
    const totalDelta = current.total - lastCpuSample.total;
    const idleDelta = current.idle - lastCpuSample.idle;
    // Keep the previous value if called again almost immediately (several clients polling)
    if (totalDelta > 0) {
        lastCpuUsage = Math.min(100, Math.max(0, (1 - idleDelta / totalDelta) * 100));
        lastCpuSample = current;
    }
    return lastCpuUsage;
};
// Keep the baseline fresh even when nobody is watching the stats page
setInterval(getCpuUsage, 5000).unref();

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

        const cpuUsage = getCpuUsage();

        // Get disk usage
        let diskUsage = { total: 0, used: 0, free: 0, percent: 0 };
        try {
            const { stdout } = await execAsync("df -BG / | tail -1", { timeout: 5000 });
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
                const { stdout } = await execAsync("df -h / | tail -1", { timeout: 5000 });
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