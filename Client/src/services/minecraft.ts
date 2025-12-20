/**
 * Minecraft Server API Service
 */
import api from './api';
import type {
  IServerInfo,
  IServerStatus,
  IPlayerInfo,
  IGameModeRequest,
  IDifficultyRequest,
  IWeatherRequest,
  ITimeRequest,
  ITeleportRequest,
  IWhitelistRequest,
  IWhitelistToggleRequest,
  IOpRequest,
  IPlayerActionRequest,
  IGiveItemRequest,
  IGiveEffectRequest,
  IClearEffectRequest,
  IGameRuleRequest,
  IBroadcastRequest,
  ICommandRequest,
  ICommandResponse,
} from '@/types/minecraft';

// Server Information & Status
export const getServerInfo = async (): Promise<IServerInfo> => {
  try {
    const { data } = await api.get('/minecraft/info');
    return data?.data || data || { ip: '', port: 25565, version: '', motd: '', onlineMode: false, maxPlayers: 10 };
  } catch {
    return { ip: '', port: 25565, version: '', motd: '', onlineMode: false, maxPlayers: 10 };
  }
};

export const getServerStatus = async (): Promise<IServerStatus> => {
  try {
    const { data } = await api.get('/minecraft/status');
    return data?.data || data || { online: false, responding: false };
  } catch {
    return { online: false, responding: false };
  }
};

export const getPlayers = async (): Promise<IPlayerInfo> => {
  try {
    const { data } = await api.get('/minecraft/players');
    return data?.data || data || { online: 0, max: 10, players: [] };
  } catch {
    return { online: 0, max: 10, players: [] };
  }
};

// Game Mode & Settings
export const setGameMode = async (payload: IGameModeRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/gamemode', payload);
  return data;
};

export const setDifficulty = async (payload: IDifficultyRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/difficulty', payload);
  return data;
};

export const setWeather = async (payload: IWeatherRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/weather', payload);
  return data;
};

export const setTime = async (payload: ITimeRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/time', payload);
  return data;
};

// World Management
export const saveWorld = async (): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/world/save');
  return data;
};

export const setGameRule = async (payload: IGameRuleRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/world/gamerule', payload);
  return data;
};

export const getWorldSeed = async (): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/world/seed');
  return data;
};

export const teleportPlayer = async (payload: ITeleportRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/teleport', payload);
  return data;
};

// Whitelist Management
export const whitelistAdd = async (payload: IWhitelistRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/whitelist/add', payload);
  return data;
};

export const whitelistRemove = async (payload: IWhitelistRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/whitelist/remove', payload);
  return data;
};

export const whitelistList = async (): Promise<ICommandResponse> => {
  const { data } = await api.get('/minecraft/whitelist/list');
  return data;
};

export const whitelistToggle = async (payload: IWhitelistToggleRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/whitelist/toggle', payload);
  return data;
};

// OP Management
export const opAdd = async (payload: IOpRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/op/add', payload);
  return data;
};

export const opRemove = async (payload: IOpRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/op/remove', payload);
  return data;
};

// Player Management
export const kickPlayer = async (payload: IPlayerActionRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/player/kick', payload);
  return data;
};

export const banPlayer = async (payload: IPlayerActionRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/player/ban', payload);
  return data;
};

export const pardonPlayer = async (payload: IWhitelistRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/player/pardon', payload);
  return data;
};

export const getBanList = async (): Promise<ICommandResponse> => {
  const { data } = await api.get('/minecraft/player/banlist');
  return data;
};

// Items & Effects
export const giveItem = async (payload: IGiveItemRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/give', payload);
  return data;
};

export const giveEffect = async (payload: IGiveEffectRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/effect/give', payload);
  return data;
};

export const clearEffect = async (payload: IClearEffectRequest): Promise<ICommandResponse> => {
  const { data} = await api.post('/minecraft/effect/clear', payload);
  return data;
};

// Communication
export const broadcast = async (payload: IBroadcastRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/broadcast', payload);
  return data;
};

export const executeCommand = async (payload: ICommandRequest): Promise<ICommandResponse> => {
  const { data } = await api.post('/minecraft/command', payload);
  return data;
};

// Server Control
// These routes use /danger (not /api/danger), so we use axios directly
import axios from 'axios';

const getDangerBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  if (envURL) {
    return envURL.replace('/api', '');
  }
  // Development: use relative path (Vite proxy will handle it)
  if (import.meta.env.DEV) {
    return '';
  }
  // Fallback for production
  return 'http://localhost:5000';
};

const dangerApi = axios.create({
  baseURL: getDangerBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const getServerControlStatus = async (): Promise<{ success: boolean; running: boolean; message: string }> => {
  const { data } = await dangerApi.get('/danger/server/status');
  return data;
};

export const startServer = async (): Promise<ICommandResponse> => {
  const { data } = await dangerApi.post('/danger/server/start');
  return data;
};

export const stopServer = async (): Promise<ICommandResponse> => {
  const { data } = await dangerApi.post('/danger/server/stop');
  return data;
};

export const restartServer = async (): Promise<ICommandResponse> => {
  const { data } = await dangerApi.post('/danger/server/restart');
  return data;
};


