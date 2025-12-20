/**
 * Molecule: GameModeControl
 * Controls for game mode, difficulty, weather, and time
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { setGameMode, setDifficulty, setWeather, setTime } from '@/services/minecraft';
import toast from 'react-hot-toast';
import type { GameMode, Difficulty, Weather } from '@/types/minecraft';

interface GameModeControlProps {
  onSuccess?: () => void;
}

export default function GameModeControl({ onSuccess }: GameModeControlProps) {
  const [player, setPlayer] = useState('');
  const [loading, setLoading] = useState(false);

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
        className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800">🎮 Game Mode</h3>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Player name"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            className="w-full"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={() => handleGameMode('survival')} disabled={loading}>
              🗡️ Survival
            </Button>
            <Button onClick={() => handleGameMode('creative')} disabled={loading}>
              ✨ Creative
            </Button>
            <Button onClick={() => handleGameMode('adventure')} disabled={loading}>
              🗺️ Adventure
            </Button>
            <Button onClick={() => handleGameMode('spectator')} disabled={loading}>
              👻 Spectator
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Difficulty */}
      <motion.div
        className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800">⚔️ Difficulty</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={() => handleDifficulty('peaceful')} disabled={loading}>
            😊 Peaceful
          </Button>
          <Button onClick={() => handleDifficulty('easy')} disabled={loading}>
            😌 Easy
          </Button>
          <Button onClick={() => handleDifficulty('normal')} disabled={loading}>
            😐 Normal
          </Button>
          <Button onClick={() => handleDifficulty('hard')} disabled={loading}>
            😤 Hard
          </Button>
        </div>
      </motion.div>

      {/* Weather */}
      <motion.div
        className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800">☁️ Weather</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => handleWeather('clear')} disabled={loading}>
            ☀️ Clear
          </Button>
          <Button onClick={() => handleWeather('rain')} disabled={loading}>
            🌧️ Rain
          </Button>
          <Button onClick={() => handleWeather('thunder')} disabled={loading}>
            ⛈️ Thunder
          </Button>
        </div>
      </motion.div>

      {/* Time */}
      <motion.div
        className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800">🕐 Time</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={() => handleTime('day')} disabled={loading}>
            🌅 Day
          </Button>
          <Button onClick={() => handleTime('noon')} disabled={loading}>
            ☀️ Noon
          </Button>
          <Button onClick={() => handleTime('night')} disabled={loading}>
            🌙 Night
          </Button>
          <Button onClick={() => handleTime('midnight')} disabled={loading}>
            🌃 Midnight
          </Button>
        </div>
      </motion.div>
    </div>
  );
}


