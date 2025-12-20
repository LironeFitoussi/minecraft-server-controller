/**
 * Molecule: QuickActionsPanel
 * Quick action buttons for common server commands
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { saveWorld, broadcast, giveItem, teleportPlayer, startServer, stopServer, restartServer, getServerControlStatus, getPlayers } from '@/services/minecraft';
import GiveItemModal from './GiveItemModal';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function QuickActionsPanel() {
  const [message, setMessage] = useState('');
  const [player, setPlayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [giveModalOpen, setGiveModalOpen] = useState(false);
  const [serverRunning, setServerRunning] = useState<boolean | null>(null);
  const [tpX, setTpX] = useState('0');
  const [tpY, setTpY] = useState('64');
  const [tpZ, setTpZ] = useState('0');

  // Fetch active players
  const { data: playersData } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const activePlayers = playersData?.players || [];

  const handleSaveWorld = async () => {
    setLoading(true);
    try {
      await saveWorld();
      toast.success('World saved successfully!');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setLoading(true);
    try {
      await broadcast({ message });
      toast.success('Message broadcasted!');
      setMessage('');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveItem = async (playerName: string, item: string, count: number) => {
    setLoading(true);
    try {
      await giveItem({ player: playerName, item, count });
      toast.success(`Gave ${count} ${item} to ${playerName}`);
      setPlayer(''); // Clear player input after giving
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeleport = async () => {
    if (!player.trim()) {
      toast.error('Please enter a player name');
      return;
    }
    const x = parseFloat(tpX);
    const y = parseFloat(tpY);
    const z = parseFloat(tpZ);
    
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      toast.error('Please enter valid coordinates (numbers only)');
      return;
    }
    
    setLoading(true);
    try {
      await teleportPlayer({ player, x, y, z });
      toast.success(`Teleported ${player} to (${x}, ${y}, ${z})`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Check server status on mount and periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getServerControlStatus();
        setServerRunning(status.running);
      } catch (error) {
        console.error('Failed to check server status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStartServer = async () => {
    setLoading(true);
    try {
      await startServer();
      toast.success('Server start command sent');
      setTimeout(() => {
        getServerControlStatus().then(status => setServerRunning(status.running));
      }, 2000);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopServer = async () => {
    if (!confirm('Are you sure you want to stop the Minecraft server? All players will be disconnected.')) {
      return;
    }
    setLoading(true);
    try {
      await stopServer();
      toast.success('Server stop command sent');
      setTimeout(() => {
        getServerControlStatus().then(status => setServerRunning(status.running));
      }, 2000);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestartServer = async () => {
    if (!confirm('Are you sure you want to restart the Minecraft server? All players will be disconnected.')) {
      return;
    }
    setLoading(true);
    try {
      await restartServer();
      toast.success('Server restart command sent');
      setTimeout(() => {
        getServerControlStatus().then(status => setServerRunning(status.running));
      }, 3000);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="minecraft-card minecraft-pattern rounded-lg p-6 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg pixelify-sans-bold" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>⚡ Quick Actions</h2>

      <div className="space-y-4">
        {/* Server Control */}
        <div className="minecraft-card-light minecraft-pattern rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Server Control</label>
            {serverRunning !== null && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                serverRunning 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {serverRunning ? '🟢 Running' : '🔴 Stopped'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              onClick={handleStartServer} 
              disabled={loading || serverRunning === true}
              className="minecraft-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶️ Start
            </Button>
            <Button 
              onClick={handleStopServer} 
              disabled={loading || serverRunning === false}
              className="minecraft-button minecraft-button-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏹️ Stop
            </Button>
            <Button 
              onClick={handleRestartServer} 
              disabled={loading || serverRunning === false}
              className="minecraft-button minecraft-button-warning disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Restart
            </Button>
          </div>
        </div>
        {/* Give Item - Standalone Button */}
        <div className="minecraft-card-light minecraft-pattern rounded-lg p-4">
          <Button 
            onClick={() => setGiveModalOpen(true)} 
            disabled={loading} 
            className="w-full minecraft-button disabled:opacity-50"
            style={{ background: 'linear-gradient(145deg, #42A5F5 0%, #1E88E5 100%)', borderColor: '#1565C0' }}
          >
            🎁 Give Item to Player
          </Button>
        </div>

        {/* Save World */}
        <div className="minecraft-card-light minecraft-pattern rounded-lg p-4">
          <Button onClick={handleSaveWorld} disabled={loading} className="w-full minecraft-button disabled:opacity-50">
            💾 Save World
          </Button>
        </div>

        {/* Broadcast */}
        <div className="minecraft-card-light minecraft-pattern rounded-lg p-4 space-y-2">
          <label className="text-sm font-medium text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Broadcast Message</label>
          <Input
            type="text"
            placeholder="Enter message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="minecraft-input"
          />
          <Button onClick={handleBroadcast} disabled={loading} className="w-full minecraft-button disabled:opacity-50">
            📢 Broadcast
          </Button>
        </div>

        {/* Teleport Player */}
        <div className="minecraft-card-light minecraft-pattern rounded-lg p-4 space-y-2">
          <label className="text-sm font-medium text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Teleport Player</label>
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
              placeholder="No players online - Enter player name..."
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="minecraft-input"
            />
          )}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>X Coordinate</label>
              <Input
                type="number"
                placeholder="X"
                value={tpX}
                onChange={(e) => setTpX(e.target.value)}
                step="0.1"
                className="minecraft-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>Y Coordinate</label>
              <Input
                type="number"
                placeholder="Y"
                value={tpY}
                onChange={(e) => setTpY(e.target.value)}
                step="0.1"
                className="minecraft-input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>Z Coordinate</label>
              <Input
                type="number"
                placeholder="Z"
                value={tpZ}
                onChange={(e) => setTpZ(e.target.value)}
                step="0.1"
                className="minecraft-input"
              />
            </div>
          </div>
          <Button onClick={handleTeleport} disabled={loading || !player.trim()} className="w-full minecraft-button disabled:opacity-50">
            🚀 Teleport Player
          </Button>
        </div>
      </div>

      {/* Give Item Modal */}
      <GiveItemModal
        open={giveModalOpen}
        onOpenChange={setGiveModalOpen}
        onGive={handleGiveItem}
        initialPlayer={player}
      />
    </motion.div>
  );
}



