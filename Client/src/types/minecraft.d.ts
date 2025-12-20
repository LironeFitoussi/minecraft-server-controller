/**
 * Minecraft Server Controller Types - Frontend
 */

export interface IServerStatus {
  online: boolean;
  responding: boolean;
  uptime?: number;
}

export interface IServerInfo {
  ip: string;
  port: number;
  version: string;
  motd: string;
  onlineMode: boolean;
  maxPlayers: number;
}

export interface IPlayerInfo {
  online: number;
  max: number;
  players: string[];
}

export interface ICommandResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export type GameMode = 'survival' | 'creative' | 'adventure' | 'spectator';
export type Difficulty = 'peaceful' | 'easy' | 'normal' | 'hard';
export type Weather = 'clear' | 'rain' | 'thunder';
export type TimeValue = 'day' | 'noon' | 'night' | 'midnight' | number;

export interface IGameModeRequest {
  player: string;
  mode: GameMode;
}

export interface IDifficultyRequest {
  difficulty: Difficulty;
}

export interface IWeatherRequest {
  weather: Weather;
  duration?: number;
}

export interface ITimeRequest {
  action: 'set' | 'add' | 'query';
  value?: TimeValue;
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

export interface IPlayerActionRequest {
  player: string;
  reason?: string;
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

// Common items for UI
export interface IMinecraftItem {
  value: string;
  label: string;
  icon?: string;
}

// Common effects for UI
export interface IMinecraftEffect {
  value: string;
  label: string;
  icon?: string;
}

// Common game rules for UI
export interface IGameRule {
  value: string;
  label: string;
  description?: string;
}


