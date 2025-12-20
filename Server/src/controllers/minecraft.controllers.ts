/**
 * Minecraft Server Controller
 */
import type { Request, Response } from 'express';
import { rconService } from '../utils/rcon';
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import type {
  IGameModeRequest,
  IDifficultyRequest,
  IWeatherRequest,
  ITimeRequest,
  ITeleportRequest,
  IWhitelistRequest,
  IWhitelistToggleRequest,
  IOpRequest,
  IPlayerKickRequest,
  IPlayerBanRequest,
  IPlayerPardonRequest,
  IGiveItemRequest,
  IGiveEffectRequest,
  IClearEffectRequest,
  IGameRuleRequest,
  IBroadcastRequest,
  ICommandRequest,
} from '../types/minecraft';

const execAsync = promisify(exec);

// Helper to safely send response
const sendResponse = (res: Response, status: number, data: any): void => {
  if (!res.headersSent) {
    res.status(status).json(data);
  }
};

// Helper to handle RCON errors with user-friendly messages
const handleRconError = (res: Response, error: Error): void => {
  const errorMsg = error.message;
  if (errorMsg.includes('timeout') || errorMsg.includes('RCON') || errorMsg.includes('connect')) {
    sendResponse(res, 503, { 
      success: false, 
      error: 'Minecraft server is not responding. Please check if the server is running and RCON is enabled.' 
    });
  } else {
    sendResponse(res, 500, { success: false, error: errorMsg });
  }
};

class MinecraftController {
  /**
   * Get server information
   */
  async getServerInfo(_req: Request, res: Response): Promise<void> {
    try {
      const propsFile = process.env.MINECRAFT_SERVER_PROPERTIES || '/opt/minecraft/server/server.properties';
      
      let serverInfo = {
        ip: '0.0.0.0',
        port: 25565,
        version: 'Minecraft Server',
        motd: 'Minecraft Server',
        onlineMode: true,
        maxPlayers: 10,
      };

      // Try to read server.properties, but don't fail if we can't
      try {
        const props = readFileSync(propsFile, 'utf8');
        const portMatch = props.match(/^server-port=(.+)$/m);
        const motdMatch = props.match(/^motd=(.+)$/m);
        const onlineModeMatch = props.match(/^online-mode=(.+)$/m);
        const maxPlayersMatch = props.match(/^max-players=(.+)$/m);

        if (portMatch?.[1]) serverInfo.port = parseInt(portMatch[1].trim());
        if (motdMatch?.[1]) serverInfo.motd = motdMatch[1].trim().replace(/§./g, '');
        if (onlineModeMatch?.[1]) serverInfo.onlineMode = onlineModeMatch[1].trim() === 'true';
        if (maxPlayersMatch?.[1]) serverInfo.maxPlayers = parseInt(maxPlayersMatch[1].trim());
      } catch (error) {
        // Silently fail - use defaults if we can't read the file
        // This is expected if file doesn't exist or permissions are wrong
      }

      // Try to get actual server IP
      try {
        const { stdout } = await execAsync('hostname -I | awk \'{print $1}\'');
        const ip = stdout.trim();
        if (ip) serverInfo.ip = ip;
      } catch {
        // Use default
      }

      sendResponse(res, 200, { success: true, data: serverInfo });
    } catch (error) {
      sendResponse(res, 500, { success: false, error: (error as Error).message });
    }
  }

  /**
   * Get server status
   */
  async getServerStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = await rconService.getServerStatus();
      sendResponse(res, 200, { success: true, data: status });
    } catch (error) {
      // Return a default status instead of error if RCON fails
      sendResponse(res, 200, { 
        success: true, 
        data: { 
          online: false, 
          responding: false 
        } 
      });
    }
  }

  /**
   * Get online players
   */
  async getPlayers(_req: Request, res: Response): Promise<void> {
    try {
      const players = await rconService.getPlayers();
      sendResponse(res, 200, { success: true, data: players });
    } catch (error) {
      // Return empty players list instead of error if RCON fails
      sendResponse(res, 200, { 
        success: true, 
        data: { 
          online: 0, 
          max: 10, 
          players: [] 
        } 
      });
    }
  }

  /**
   * Change game mode
   */
  async setGameMode(req: Request, res: Response): Promise<void> {
    try {
      const { player, mode } = req.body as IGameModeRequest;

      if (!player || !mode) {
        sendResponse(res, 400, { success: false, error: 'Player and mode are required' });
        return;
      }

      const validModes = ['survival', 'creative', 'adventure', 'spectator'];
      if (!validModes.includes(mode)) {
        sendResponse(res, 400, { success: false, error: `Invalid mode. Must be one of: ${validModes.join(', ')}` });
        return;
      }

      const response = await rconService.sendCommand(`gamemode ${mode} ${player}`);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('timeout') || errorMsg.includes('RCON')) {
        sendResponse(res, 503, { 
          success: false, 
          error: 'Minecraft server is not responding. Please check if the server is running and RCON is enabled.' 
        });
      } else {
        sendResponse(res, 500, { success: false, error: errorMsg });
      }
    }
  }

  /**
   * Set difficulty
   */
  async setDifficulty(req: Request, res: Response): Promise<void> {
    try {
      const { difficulty } = req.body as IDifficultyRequest;

      if (!difficulty) {
        sendResponse(res, 400, { success: false, error: 'Difficulty is required' });
        return;
      }

      const validDifficulties = ['peaceful', 'easy', 'normal', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        sendResponse(res, 400, { success: false, error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` });
        return;
      }

      const response = await rconService.sendCommand(`difficulty ${difficulty}`);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('timeout') || errorMsg.includes('RCON')) {
        sendResponse(res, 503, { 
          success: false, 
          error: 'Minecraft server is not responding. Please check if the server is running and RCON is enabled.' 
        });
      } else {
        sendResponse(res, 500, { success: false, error: errorMsg });
      }
    }
  }

  /**
   * Control weather
   */
  async setWeather(req: Request, res: Response): Promise<void> {
    try {
      const { weather, duration } = req.body as IWeatherRequest;

      if (!weather) {
        sendResponse(res, 400, { success: false, error: 'Weather is required' });
        return;
      }

      const validWeather = ['clear', 'rain', 'thunder'];
      if (!validWeather.includes(weather)) {
        sendResponse(res, 400, { success: false, error: `Invalid weather. Must be one of: ${validWeather.join(', ')}` });
        return;
      }

      const command = duration ? `weather ${weather} ${duration}` : `weather ${weather}`;
      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('timeout') || errorMsg.includes('RCON')) {
        sendResponse(res, 503, { 
          success: false, 
          error: 'Minecraft server is not responding. Please check if the server is running and RCON is enabled.' 
        });
      } else {
        sendResponse(res, 500, { success: false, error: errorMsg });
      }
    }
  }

  /**
   * Control time
   */
  async setTime(req: Request, res: Response): Promise<void> {
    try {
      const { action, value } = req.body as ITimeRequest;

      if (!action) {
        sendResponse(res, 400, { success: false, error: 'Action is required (set, add, query)' });
        return;
      }

      let command: string;
      if (action === 'set') {
        if (!value) {
          sendResponse(res, 400, { success: false, error: 'Value is required for set action' });
          return;
        }
        command = `time set ${value}`;
      } else if (action === 'add') {
        if (!value) {
          sendResponse(res, 400, { success: false, error: 'Value is required for add action' });
          return;
        }
        command = `time add ${value}`;
      } else if (action === 'query') {
        command = 'time query daytime';
      } else {
        sendResponse(res, 400, { success: false, error: 'Invalid action. Must be: set, add, or query' });
        return;
      }

      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('timeout') || errorMsg.includes('RCON')) {
        sendResponse(res, 503, { 
          success: false, 
          error: 'Minecraft server is not responding. Please check if the server is running and RCON is enabled.' 
        });
      } else {
        sendResponse(res, 500, { success: false, error: errorMsg });
      }
    }
  }

  /**
   * Teleport player
   */
  async teleportPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { player, target, x, y, z } = req.body as ITeleportRequest;

      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }

      let command: string;
      if (target) {
        command = `tp ${player} ${target}`;
      } else if (x !== undefined && y !== undefined && z !== undefined) {
        command = `tp ${player} ${x} ${y} ${z}`;
      } else {
        sendResponse(res, 400, { success: false, error: 'Either target player or coordinates (x, y, z) required' });
        return;
      }

      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Add player to whitelist
   */
  async whitelistAdd(req: Request, res: Response): Promise<void> {
    try {
      const { player } = req.body as IWhitelistRequest;
      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }
      const response = await rconService.sendCommand(`whitelist add ${player}`);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Remove player from whitelist
   */
  async whitelistRemove(req: Request, res: Response): Promise<void> {
    try {
      const { player } = req.body as IWhitelistRequest;
      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }
      const response = await rconService.sendCommand(`whitelist remove ${player}`);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * List whitelisted players
   */
  async whitelistList(_req: Request, res: Response): Promise<void> {
    try {
      const response = await rconService.sendCommand('whitelist list');
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Toggle whitelist on/off
   */
  async whitelistToggle(req: Request, res: Response): Promise<void> {
    try {
      const { enabled } = req.body as IWhitelistToggleRequest;
      if (enabled === undefined) {
        sendResponse(res, 400, { success: false, error: 'enabled (true/false) is required' });
        return;
      }
      const command = enabled ? 'whitelist on' : 'whitelist off';
      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Give OP to player
   */
  async opAdd(req: Request, res: Response): Promise<void> {
    try {
      const { player } = req.body as IOpRequest;
      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }
      const response = await rconService.sendCommand(`op ${player}`);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Remove OP from player
   */
  async opRemove(req: Request, res: Response): Promise<void> {
    try {
      const { player } = req.body as IOpRequest;
      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }
      const response = await rconService.sendCommand(`deop ${player}`);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Kick player
   */
  async kickPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { player, reason } = req.body as IPlayerKickRequest;
      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }
      const command = reason ? `kick ${player} ${reason}` : `kick ${player}`;
      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Ban player
   */
  async banPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { player, reason } = req.body as IPlayerBanRequest;
      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }
      const command = reason ? `ban ${player} ${reason}` : `ban ${player}`;
      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Pardon (unban) player
   */
  async pardonPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { player } = req.body as IPlayerPardonRequest;
      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }
      const response = await rconService.sendCommand(`pardon ${player}`);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Get ban list
   */
  async getBanList(_req: Request, res: Response): Promise<void> {
    try {
      const response = await rconService.sendCommand('banlist');
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Save world
   */
  async saveWorld(_req: Request, res: Response): Promise<void> {
    try {
      const response = await rconService.sendCommand('save-all');
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Set game rule
   */
  async setGameRule(req: Request, res: Response): Promise<void> {
    try {
      const { rule, value } = req.body as IGameRuleRequest;
      if (!rule) {
        sendResponse(res, 400, { success: false, error: 'Rule is required' });
        return;
      }
      const command = value !== undefined ? `gamerule ${rule} ${value}` : `gamerule ${rule}`;
      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Get world seed
   */
  async getWorldSeed(_req: Request, res: Response): Promise<void> {
    try {
      const response = await rconService.sendCommand('seed');
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Broadcast message
   */
  async broadcast(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body as IBroadcastRequest;
      if (!message) {
        sendResponse(res, 400, { success: false, error: 'Message is required' });
        return;
      }
      const response = await rconService.sendCommand(`say ${message}`);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      const errorMsg = (error as Error).message;
      // Provide user-friendly error message
      if (errorMsg.includes('timeout') || errorMsg.includes('RCON')) {
        sendResponse(res, 503, { 
          success: false, 
          error: 'Minecraft server is not responding. Please check if the server is running and RCON is enabled.' 
        });
      } else {
        sendResponse(res, 500, { success: false, error: errorMsg });
      }
    }
  }

  /**
   * Give items to player
   */
  async giveItem(req: Request, res: Response): Promise<void> {
    try {
      const { player, item, count } = req.body as IGiveItemRequest;
      if (!player || !item) {
        sendResponse(res, 400, { success: false, error: 'Player and item are required' });
        return;
      }
      const command = count ? `give ${player} ${item} ${count}` : `give ${player} ${item}`;
      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Give effect to player
   */
  async giveEffect(req: Request, res: Response): Promise<void> {
    try {
      const { player, effect, duration, amplifier } = req.body as IGiveEffectRequest;
      if (!player || !effect) {
        sendResponse(res, 400, { success: false, error: 'Player and effect are required' });
        return;
      }
      let command = `effect give ${player} ${effect}`;
      if (duration) command += ` ${duration}`;
      if (amplifier !== undefined) command += ` ${amplifier}`;

      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Clear effects from player
   */
  async clearEffect(req: Request, res: Response): Promise<void> {
    try {
      const { player, effect } = req.body as IClearEffectRequest;
      if (!player) {
        sendResponse(res, 400, { success: false, error: 'Player is required' });
        return;
      }
      const command = effect ? `effect clear ${player} ${effect}` : `effect clear ${player}`;
      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }

  /**
   * Execute custom command
   */
  async executeCommand(req: Request, res: Response): Promise<void> {
    try {
      const { command } = req.body as ICommandRequest;
      if (!command || typeof command !== 'string') {
        sendResponse(res, 400, { success: false, error: 'Command is required' });
        return;
      }
      const response = await rconService.sendCommand(command);
      sendResponse(res, 200, { success: true, response });
    } catch (error) {
      handleRconError(res, error as Error);
    }
  }
}

export default MinecraftController;



