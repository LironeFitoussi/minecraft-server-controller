/**
 * RCON Utility Service for Minecraft Server
 */
import Rcon from 'rcon';
import { readFileSync } from 'fs';
import type { IRCONConfig, IPlayerInfo, IMinecraftServerStatus } from '../types/minecraft';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class RCONService {
  private client: Rcon | null = null;
  private config: IRCONConfig | null = null;
  private connected: boolean = false;
  private connecting: boolean = false; // Lock to prevent multiple simultaneous connections
  private connectionPromise: Promise<void> | null = null;

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
   * Connect to RCON server
   */
  async connect(): Promise<void> {
    // If already connected, return immediately
    if (this.connected && this.client) {
      return;
    }

    // If already connecting, wait for that connection to complete
    if (this.connecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    const config = this.getConfig();
    if (!config.password) {
      throw new Error('RCON password not configured. Set MINECRAFT_RCON_PASSWORD or MINECRAFT_RCON_PASSWORD_FILE');
    }

    // Set connecting lock
    this.connecting = true;

    // Clean up old connection if it exists
    if (this.client) {
      try {
        this.client.removeAllListeners();
        this.client.disconnect();
      } catch {}
      this.client = null;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.connecting = false;
        this.connectionPromise = null;
        if (this.client) {
          try {
            this.client.removeAllListeners();
            this.client.disconnect();
          } catch {}
        }
        this.connected = false;
        this.client = null;
        reject(new Error('RCON connection timeout. Is Minecraft server running?'));
      }, 5000);

      try {
        console.log(`🔌 Attempting RCON connection to ${config.host}:${config.port}`);
        this.client = new Rcon(config.host, config.port, config.password);

        this.client.once('auth', () => {
          clearTimeout(timeout);
          this.connected = true;
          this.connecting = false;
          this.connectionPromise = null;
          console.log('✅ RCON connected successfully');
          resolve();
        });

        this.client.once('error', (err: Error) => {
          clearTimeout(timeout);
          this.connecting = false;
          this.connectionPromise = null;
          console.error('❌ RCON connection error:', err.message);
          this.connected = false;
          this.client = null;
          reject(err);
        });

        this.client.on('end', () => {
          console.log('🔌 RCON disconnected');
          this.connected = false;
          this.connecting = false;
          this.connectionPromise = null;
        });

        this.client.connect();
      } catch (error) {
        clearTimeout(timeout);
        this.connecting = false;
        this.connectionPromise = null;
        this.connected = false;
        this.client = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Send command to Minecraft server via RCON
   */
  async sendCommand(command: string): Promise<string> {
    // Ensure we're connected before sending
    if (!this.connected || !this.client) {
      try {
        await this.connect();
        // Wait a bit to ensure auth is complete
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        const errorMsg = (error as Error).message;
        if (errorMsg.includes('password')) {
          throw new Error('RCON password not configured. Set MINECRAFT_RCON_PASSWORD or MINECRAFT_RCON_PASSWORD_FILE');
        }
        if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('connect')) {
          throw new Error('Cannot connect to Minecraft server. Is the server running and RCON is enabled?');
        }
        throw new Error(`RCON connection failed: ${errorMsg}`);
      }
      if (!this.connected || !this.client) {
        throw new Error('RCON not connected. Check if Minecraft server is running and RCON is enabled in server.properties');
      }
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Don't disconnect on timeout - just mark as disconnected for next attempt
        this.connected = false;
        reject(new Error('RCON command timeout. Server may be unresponsive.'));
      }, 10000); // 10 seconds for commands

      let responseReceived = false;
      
      const cleanup = () => {
        if (this.client) {
          this.client.removeListener('response', responseHandler);
          this.client.removeListener('error', errorHandler);
        }
      };
      
      // The rcon library ONLY uses events, not callbacks
      // The send method signature is: send(data, cmd, id)
      // We need to listen for the 'response' event
      const responseHandler = (response: string) => {
        if (!responseReceived) {
          responseReceived = true;
          clearTimeout(timeout);
          cleanup();
          console.log(`📤 RCON command "${command}" response:`, response.substring(0, 200));
          resolve(response);
        }
      };

      const errorHandler = (err: Error) => {
        if (!responseReceived) {
          responseReceived = true;
          clearTimeout(timeout);
          cleanup();
          this.connected = false;
          console.error(`❌ RCON command "${command}" error:`, err.message);
          reject(err);
        }
      };

      try {
        if (!this.client) {
          clearTimeout(timeout);
          reject(new Error('RCON client not available'));
          return;
        }

        // Set up event listeners BEFORE sending the command
        this.client.once('response', responseHandler);
        this.client.once('error', errorHandler);
        
        // Send command - the library signature is send(data, cmd, id)
        // cmd defaults to PacketType.COMMAND (0x02) if not provided
        console.log(`📥 Sending RCON command: "${command}"`);
        // Type assertion needed because TypeScript types don't match actual implementation
        (this.client as any).send(command);
      } catch (error) {
        clearTimeout(timeout);
        cleanup();
        this.connected = false;
        console.error(`❌ RCON command "${command}" exception:`, (error as Error).message);
        reject(error);
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
        await execAsync('pgrep -f "server.jar"');
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
    if (this.client) {
      try {
        this.client.removeAllListeners();
        this.client.disconnect();
      } catch {}
      this.client = null;
    }
    this.connected = false;
    this.connecting = false;
    this.connectionPromise = null;
  }
}

// Singleton instance
export const rconService = new RCONService();



