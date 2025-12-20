/**
 * Minecraft Server Controller Types
 */

export interface IMinecraftServerStatus {
  online: boolean;
  responding: boolean;
  uptime?: number;
}

export interface IPlayerInfo {
  online: number;
  max: number;
  players: string[];
}

export interface IServerInfo {
  ip: string;
  port: number;
  version: string;
  motd: string;
  onlineMode: boolean;
  maxPlayers: number;
}

export interface IGameModeRequest {
  player: string;
  mode: 'survival' | 'creative' | 'adventure' | 'spectator';
}

export interface IDifficultyRequest {
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard';
}

export interface IWeatherRequest {
  weather: 'clear' | 'rain' | 'thunder';
  duration?: number;
}

export interface ITimeRequest {
  action: 'set' | 'add' | 'query';
  value?: string | number;
}

export interface ITeleportRequest {
  player: string;
  target?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface IWhitelistRequest {
  player: string;
}

export interface IWhitelistToggleRequest {
  enabled: boolean;
}

export interface IOpRequest {
  player: string;
}

export interface IPlayerKickRequest {
  player: string;
  reason?: string;
}

export interface IPlayerBanRequest {
  player: string;
  reason?: string;
}

export interface IPlayerPardonRequest {
  player: string;
}

export interface IGiveItemRequest {
  player: string;
  item: string;
  count?: number;
}

export interface IGiveEffectRequest {
  player: string;
  effect: string;
  duration?: number;
  amplifier?: number;
}

export interface IClearEffectRequest {
  player: string;
  effect?: string;
}

export interface IGameRuleRequest {
  rule: string;
  value?: string | boolean;
}

export interface IBroadcastRequest {
  message: string;
}

export interface ICommandRequest {
  command: string;
}

export interface ICommandResponse {
  success: boolean;
  response: string;
}

export interface IRCONConfig {
  host: string;
  port: number;
  password: string;
}


