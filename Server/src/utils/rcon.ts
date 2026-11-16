/**
 * RCON Utility Service for Minecraft Server
 */
import Rcon from 'rcon';
import { readFileSync } from 'fs';
import type { IRCONConfig, IPlayerInfo, IMinecraftServerStatus } from '../types/minecraft';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const CONNECT_TIMEOUT_MS = 5000;
const COMMAND_TIMEOUT_MS = 10000;
// After a failed connection, fail fast for a short while instead of making
// every queued/polling request wait for its own connection timeout.
const FAILURE_COOLDOWN_MS = 3000;
// Max commands waiting in line before new ones are rejected.
const MAX_QUEUE_LENGTH = 25;
// Packet id/type used to mark the end of a (possibly multi-packet) response.
const SENTINEL_ID = 0x0012d4a7;
const SENTINEL_TYPE = 200;
// If the server never answers the sentinel, resolve this long after the last chunk.
const SENTINEL_FALLBACK_MS = 300;

interface IPendingCommand {
  settle: (error: Error | null, response?: string) => void;
}

class RCONService {
  private client: Rcon | null = null;
  private config: IRCONConfig | null = null;
  private connectionPromise: Promise<Rcon> | null = null;
  // The RCON library cannot match responses to requests, so commands must run
  // strictly one at a time. This promise chain is the queue.
  private queue: Promise<unknown> = Promise.resolve();
  private queueLength = 0;
  private pending: IPendingCommand | null = null;
  private lastFailure: { at: number; error: Error } | null = null;

  /**
   * Get or initialize config (lazy loading after dotenv.config())
   */
  private getConfig(): IRCONConfig {
    if (!this.config) {
      this.config = {
        host: process.env.MINECRAFT_HOST || 'localhost',
        port: parseInt(process.env.MINECRAFT_RCON_PORT || '25575'),
        password: this.loadPassword(),
      };
    }
    return this.config;
  }

  /**
   * Load RCON password from file or environment
   */
  private loadPassword(): string {
    try {
      // Try to read from file first
      const passwordFile = process.env.MINECRAFT_RCON_PASSWORD_FILE || '/opt/minecraft/rcon_password';
      return readFileSync(passwordFile, 'utf8').trim();
    } catch {
      // Fallback to environment variable
      return process.env.MINECRAFT_RCON_PASSWORD || '';
    }
  }

  /**
   * Fully close a client: detach our listeners, destroy the socket and fail
   * whatever command was waiting on it.
   */
  private teardown(client: Rcon | null, reason: Error): void {
    if (client) {
      client.removeAllListeners();
      // A late socket error must never become an unhandled 'error' event
      client.on('error', () => {});
      try {
        client.disconnect();
        // disconnect() only half-closes; destroy so a hung socket can't linger
        (client as any)._tcpSocket?.destroy();
      } catch {}
    }
    if (this.client === client) {
      this.client = null;
      const pending = this.pending;
      this.pending = null;
      pending?.settle(reason);
    }
  }

  /**
   * Get an authenticated RCON client, connecting if needed
   */
  private connect(): Promise<Rcon> {
    if (this.client) {
      return Promise.resolve(this.client);
    }
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    if (this.lastFailure && Date.now() - this.lastFailure.at < FAILURE_COOLDOWN_MS) {
      return Promise.reject(this.lastFailure.error);
    }

    const config = this.getConfig();
    if (!config.password) {
      // Re-read next time so a password added later is picked up without a restart
      this.config = null;
      return Promise.reject(
        new Error('RCON password not configured. Set MINECRAFT_RCON_PASSWORD or MINECRAFT_RCON_PASSWORD_FILE')
      );
    }

    const promise = new Promise<Rcon>((resolve, reject) => {
      console.log(`🔌 Attempting RCON connection to ${config.host}:${config.port}`);
      const client = new Rcon(config.host, config.port, config.password);
      let settled = false;

      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        console.error('❌ RCON connection error:', error.message);
        this.lastFailure = { at: Date.now(), error };
        if (error.message.includes('Authentication failed')) {
          // Password may have been changed on disk; reload it on the next attempt
          this.config = null;
        }
        this.teardown(client, error);
        reject(error);
      };

      const timeout = setTimeout(() => {
        fail(new Error('RCON connection timeout. Is Minecraft server running?'));
      }, CONNECT_TIMEOUT_MS);

      client.on('error', (err: Error) => {
        if (settled) {
          console.error('❌ RCON error:', err.message);
          this.teardown(client, err);
        } else {
          fail(err);
        }
      });

      client.on('end', () => {
        if (settled) {
          console.log('🔌 RCON disconnected');
          this.teardown(client, new Error('RCON connection closed by server'));
        } else {
          fail(new Error('RCON connection closed before authentication'));
        }
      });

      client.once('auth', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        this.client = client;
        this.lastFailure = null;
        console.log('✅ RCON connected successfully');
        resolve(client);
      });

      try {
        client.connect();
      } catch (error) {
        fail(error as Error);
      }
    }).finally(() => {
      this.connectionPromise = null;
    });

    this.connectionPromise = promise;
    return promise;
  }

  /**
   * Send command to Minecraft server via RCON.
   * Commands are queued and executed one at a time.
   */
  sendCommand(command: string): Promise<string> {
    if (this.queueLength >= MAX_QUEUE_LENGTH) {
      return Promise.reject(new Error('RCON is busy: too many commands waiting. Server may be unresponsive.'));
    }
    this.queueLength++;
    const run = () => this.execute(command);
    const result = this.queue.then(run, run).finally(() => {
      this.queueLength--;
    });
    this.queue = result.catch(() => {});
    return result;
  }

  private async execute(command: string): Promise<string> {
    let client: Rcon;
    try {
      client = await this.connect();
    } catch (error) {
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('password') || errorMsg.includes('timeout')) {
        throw error;
      }
      if (errorMsg.includes('Authentication failed')) {
        throw new Error('RCON authentication failed. Check the RCON password.');
      }
      if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('connect')) {
        throw new Error('Cannot connect to Minecraft server. Is the server running and RCON is enabled?');
      }
      throw new Error(`RCON connection failed: ${errorMsg}`);
    }

    return new Promise<string>((resolve, reject) => {
      const chunks: string[] = [];
      let fallbackTimer: NodeJS.Timeout | undefined;
      let done = false;

      const onResponse = (chunk: string) => {
        chunks.push(chunk);
        clearTimeout(fallbackTimer);
        fallbackTimer = setTimeout(() => settle(null, chunks.join('')), SENTINEL_FALLBACK_MS);
      };
      // The sentinel reply arrives on the 'server' event, after all response chunks
      // (Minecraft always sends at least one response packet first, so a
      // sentinel that shows up before any chunk is ignored.)
      const onSentinel = () => {
        if (chunks.length > 0) settle(null, chunks.join(''));
      };

      const settle = (error: Error | null, response = '') => {
        if (done) return;
        done = true;
        if (this.pending === pending) this.pending = null;
        clearTimeout(timeout);
        clearTimeout(fallbackTimer);
        client.removeListener('response', onResponse);
        client.removeListener('server', onSentinel);
        if (error) {
          console.error(`❌ RCON command "${command}" error:`, error.message);
          reject(error);
        } else {
          console.log(`📤 RCON command "${command}" response:`, response.substring(0, 200));
          resolve(response);
        }
      };

      const pending: IPendingCommand = { settle };
      this.pending = pending;

      const timeout = setTimeout(() => {
        // The connection state is unknown now (a late reply would be mistaken
        // for the next command's answer), so drop it and reconnect next time.
        const error = new Error('RCON command timeout. Server may be unresponsive.');
        this.lastFailure = { at: Date.now(), error };
        this.teardown(client, error);
      }, COMMAND_TIMEOUT_MS);

      client.on('response', onResponse);
      client.on('server', onSentinel);

      try {
        console.log(`📥 Sending RCON command: "${command}"`);
        client.send(command);
        // Minecraft answers an unknown packet type right after the full command
        // response, which tells us a multi-packet response is complete.
        client.send('', SENTINEL_TYPE, SENTINEL_ID);
      } catch (error) {
        this.teardown(client, error as Error);
      }
    });
  }

  /**
   * Get online players
   */
  async getPlayers(): Promise<IPlayerInfo> {
    try {
      const response = await this.sendCommand('list');
      console.log('📋 Raw list response:', response);
      
      // Try multiple regex patterns to match different Minecraft versions
      // Pattern 1: "There are 2 of a max of 10 players online: Player1, Player2"
      let match = response.match(/There are (\d+) of a max of (\d+) players online[:\s]*(.*)/);
      
      // Pattern 2: "There are 2 of a max 10 players online: Player1, Player2" (no "of")
      if (!match) {
        match = response.match(/There are (\d+) of a max (\d+) players online[:\s]*(.*)/);
      }
      
      // Pattern 3: "2/10 players online: Player1, Player2"
      if (!match) {
        match = response.match(/(\d+)\/(\d+) players online[:\s]*(.*)/);
      }
      
      // Pattern 4: "There are 2 players online: Player1, Player2" (no max specified)
      if (!match) {
        match = response.match(/There are (\d+) players? online[:\s]*(.*)/);
        if (match) {
          // Use default max of 20 if not specified
          match[2] = '20';
        }
      }
      
      if (match && match[1] && match[2]) {
        const count = parseInt(match[1], 10);
        const max = parseInt(match[2], 10);
        const playersStr = (match[3] || '').trim();
        
        // Parse player list - handle empty list case
        let players: string[] = [];
        if (playersStr && playersStr.length > 0) {
          players = playersStr.split(',').map(p => p.trim()).filter(p => p.length > 0);
        }

        console.log(`👥 Parsed players: ${count}/${max}, list: [${players.join(', ')}]`);
        return { online: count, max, players };
      }

      console.warn('⚠️ Could not parse player list response:', response);
      return { online: 0, max: 20, players: [] };
    } catch (error) {
      console.error('❌ Error getting players:', (error as Error).message);
      return { online: 0, max: 20, players: [] };
    }
  }

  /**
   * Get TPS (Ticks Per Second)
   */
  async getTPS(): Promise<number> {
    try {
      // Try Forge TPS command first
      const response = await this.sendCommand('forge tps');
      const match = response.match(/Overall: ([\d.]+)/);
      if (match?.[1]) {
        return parseFloat(match[1]);
      }

      // Try vanilla /tps if available (requires plugin)
      const tpsResponse = await this.sendCommand('tps');
      const tpsMatch = tpsResponse.match(/([\d.]+)/);
      if (tpsMatch?.[1]) {
        return parseFloat(tpsMatch[1]);
      }

      return 20.0; // Default assumption
    } catch {
      return 20.0;
    }
  }

  /**
   * Get server status
   */
  async getServerStatus(): Promise<IMinecraftServerStatus> {
    try {
      // Check if server is responding
      await this.sendCommand('list');
      return {
        online: true,
        responding: true,
      };
    } catch (error) {
      // Check if process is running
      try {
        // No shell here: with a shell, pgrep -f would match the shell's own command line
        await execFileAsync('pgrep', ['-f', 'server.jar']);
        return {
          online: true,
          responding: false,
        };
      } catch {
        return {
          online: false,
          responding: false,
        };
      }
    }
  }

  /**
   * Disconnect from RCON
   */
  disconnect(): void {
    this.teardown(this.client, new Error('RCON disconnected'));
  }
}

// Singleton instance
export const rconService = new RCONService();



