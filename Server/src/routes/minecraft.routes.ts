/**
 * Minecraft Server Routes
 */
import { Router } from 'express';
import MinecraftController from '../controllers/minecraft.controllers';
import { asyncHandler } from '../utils/errorHandler';

const router = Router();
const controller = new MinecraftController();

// Server Information & Status
router.get('/info', asyncHandler(controller.getServerInfo.bind(controller)));
router.get('/status', asyncHandler(controller.getServerStatus.bind(controller)));
router.get('/players', asyncHandler(controller.getPlayers.bind(controller)));

// Game Mode & Settings
router.post('/gamemode', asyncHandler(controller.setGameMode.bind(controller)));
router.post('/difficulty', asyncHandler(controller.setDifficulty.bind(controller)));
router.post('/weather', asyncHandler(controller.setWeather.bind(controller)));
router.post('/time', asyncHandler(controller.setTime.bind(controller)));

// World Management
router.post('/world/save', asyncHandler(controller.saveWorld.bind(controller)));
router.post('/world/gamerule', asyncHandler(controller.setGameRule.bind(controller)));
router.post('/world/seed', asyncHandler(controller.getWorldSeed.bind(controller)));
router.post('/teleport', asyncHandler(controller.teleportPlayer.bind(controller)));

// Whitelist Management
router.post('/whitelist/add', asyncHandler(controller.whitelistAdd.bind(controller)));
router.post('/whitelist/remove', asyncHandler(controller.whitelistRemove.bind(controller)));
router.get('/whitelist/list', asyncHandler(controller.whitelistList.bind(controller)));
router.post('/whitelist/toggle', asyncHandler(controller.whitelistToggle.bind(controller)));

// OP Management
router.post('/op/add', asyncHandler(controller.opAdd.bind(controller)));
router.post('/op/remove', asyncHandler(controller.opRemove.bind(controller)));

// Player Management
router.post('/player/kick', asyncHandler(controller.kickPlayer.bind(controller)));
router.post('/player/ban', asyncHandler(controller.banPlayer.bind(controller)));
router.post('/player/pardon', asyncHandler(controller.pardonPlayer.bind(controller)));
router.get('/player/banlist', asyncHandler(controller.getBanList.bind(controller)));

// Items & Effects
router.post('/give', asyncHandler(controller.giveItem.bind(controller)));
router.post('/effect/give', asyncHandler(controller.giveEffect.bind(controller)));
router.post('/effect/clear', asyncHandler(controller.clearEffect.bind(controller)));

// Communication
router.post('/broadcast', asyncHandler(controller.broadcast.bind(controller)));
router.post('/command', asyncHandler(controller.executeCommand.bind(controller)));

export default router;


