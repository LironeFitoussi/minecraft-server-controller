/**
 * Molecule: GameModeControl
 * Controls for game mode, difficulty, weather, and time
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { setGameMode, setDifficulty, setWeather, setTime, getPlayers } from '@/services/minecraft';
import toast from 'react-hot-toast';
import type { GameMode, Difficulty, Weather } from '@/types/minecraft';
import { useQuery } from '@tanstack/react-query';

interface GameModeControlProps {
  onSuccess?: () => void;
}

export default function GameModeControl({ onSuccess }: GameModeControlProps) {
  const [player, setPlayer] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch active players
  const { data: playersData } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers,
    refetchInterval: 5000,
  });

  const activePlayers = playersData?.players || [];

  const handleGameMode = async (mode: GameMode) => {
    if (!player.trim()) {
      toast.error('Please enter a player name');
      return;
    }
    setLoading(true);
    try {
      await setGameMode({ player, mode });
      toast.success(`Changed ${player}'s game mode to ${mode}`);
      onSuccess?.();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDifficulty = async (difficulty: Difficulty) => {
    setLoading(true);
    try {
      await setDifficulty({ difficulty });
      toast.success(`Changed difficulty to ${difficulty}`);
      onSuccess?.();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleWeather = async (weather: Weather) => {
    setLoading(true);
    try {
      await setWeather({ weather });
      toast.success(`Changed weather to ${weather}`);
      onSuccess?.();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTime = async (value: 'day' | 'noon' | 'night' | 'midnight') => {
    setLoading(true);
    try {
      await setTime({ action: 'set', value });
      toast.success(`Set time to ${value}`);
      onSuccess?.();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Mode */}
      <motion.div
        className="minecraft-card minecraft-pattern rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-3 text-white font-bold pixelify-sans-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>🎮 Game Mode</h3>
        <div className="space-y-3">
          {activePlayers.length > 0 ? (
            <select
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="w-full px-3 py-2 minecraft-select rounded-lg"
            >
              <option value="">Select a player...</option>
              {activePlayers.map((playerName) => (
                <option key={playerName} value={playerName}>
                  {playerName}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type="text"
              placeholder="No players online - Enter player name"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="w-full border-2 border-[#5A4A3A] bg-[#8B7355] text-white placeholder:text-white/70"
            />
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={() => handleGameMode('survival')} disabled={loading} className="minecraft-button disabled:opacity-50">
              🗡️ Survival
            </Button>
            <Button onClick={() => handleGameMode('creative')} disabled={loading} className="minecraft-button disabled:opacity-50">
              ✨ Creative
            </Button>
            <Button onClick={() => handleGameMode('adventure')} disabled={loading} className="minecraft-button disabled:opacity-50">
              🗺️ Adventure
            </Button>
            <Button onClick={() => handleGameMode('spectator')} disabled={loading} className="minecraft-button disabled:opacity-50">
              👻 Spectator
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Difficulty */}
      <motion.div
        className="minecraft-card minecraft-pattern rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-3 text-white font-bold pixelify-sans-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>⚔️ Difficulty</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={() => handleDifficulty('peaceful')} disabled={loading} className="minecraft-button disabled:opacity-50">
            😊 Peaceful
          </Button>
          <Button onClick={() => handleDifficulty('easy')} disabled={loading} className="minecraft-button disabled:opacity-50">
            😌 Easy
          </Button>
          <Button onClick={() => handleDifficulty('normal')} disabled={loading} className="minecraft-button disabled:opacity-50">
            😐 Normal
          </Button>
          <Button onClick={() => handleDifficulty('hard')} disabled={loading} className="minecraft-button disabled:opacity-50">
            😤 Hard
          </Button>
        </div>
      </motion.div>

      {/* Weather */}
      <motion.div
        className="minecraft-card minecraft-pattern rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-3 text-white font-bold pixelify-sans-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>☁️ Weather</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => handleWeather('clear')} disabled={loading} className="minecraft-button disabled:opacity-50">
            ☀️ Clear
          </Button>
          <Button onClick={() => handleWeather('rain')} disabled={loading} className="minecraft-button disabled:opacity-50">
            🌧️ Rain
          </Button>
          <Button onClick={() => handleWeather('thunder')} disabled={loading} className="minecraft-button disabled:opacity-50">
            ⛈️ Thunder
          </Button>
        </div>
      </motion.div>

      {/* Time */}
      <motion.div
        className="minecraft-card minecraft-pattern rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-3 text-white font-bold pixelify-sans-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>🕐 Time</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={() => handleTime('day')} disabled={loading} className="minecraft-button disabled:opacity-50">
            🌅 Day
          </Button>
          <Button onClick={() => handleTime('noon')} disabled={loading} className="minecraft-button disabled:opacity-50">
            ☀️ Noon
          </Button>
          <Button onClick={() => handleTime('night')} disabled={loading} className="minecraft-button disabled:opacity-50">
            🌙 Night
          </Button>
          <Button onClick={() => handleTime('midnight')} disabled={loading} className="minecraft-button disabled:opacity-50">
            🌃 Midnight
          </Button>
        </div>
      </motion.div>
    </div>
  );
}



