/**
 * Molecule: QuickActionsPanel
 * Quick action buttons for common server commands
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { saveWorld, broadcast, giveItem, teleportPlayer, startServer, stopServer, restartServer, getServerControlStatus } from '@/services/minecraft';
import GiveItemModal from './GiveItemModal';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function QuickActionsPanel() {
  const [message, setMessage] = useState('');
  const [player, setPlayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [giveModalOpen, setGiveModalOpen] = useState(false);
  const [serverRunning, setServerRunning] = useState<boolean | null>(null);
  const [tpX, setTpX] = useState('0');
  const [tpY, setTpY] = useState('64');
  const [tpZ, setTpZ] = useState('0');

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
      className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>

      <div className="space-y-4">
        {/* Server Control */}
        <div className="bg-white/40 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Server Control</label>
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              ▶️ Start
            </Button>
            <Button 
              onClick={handleStopServer} 
              disabled={loading || serverRunning === false}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              ⏹️ Stop
            </Button>
            <Button 
              onClick={handleRestartServer} 
              disabled={loading || serverRunning === false}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              🔄 Restart
            </Button>
          </div>
        </div>
        {/* Give Item - Standalone Button */}
        <div className="bg-white/40 rounded-2xl p-4">
          <Button 
            onClick={() => setGiveModalOpen(true)} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
          >
            🎁 Give Item to Player
          </Button>
        </div>

        {/* Save World */}
        <div className="bg-white/40 rounded-2xl p-4">
          <Button onClick={handleSaveWorld} disabled={loading} className="w-full">
            💾 Save World
          </Button>
        </div>

        {/* Broadcast */}
        <div className="bg-white/40 rounded-2xl p-4 space-y-2">
          <label className="text-sm font-medium text-gray-700">Broadcast Message</label>
          <Input
            type="text"
            placeholder="Enter message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={handleBroadcast} disabled={loading} className="w-full">
            📢 Broadcast
          </Button>
        </div>

        {/* Teleport Player */}
        <div className="bg-white/40 rounded-2xl p-4 space-y-2">
          <label className="text-sm font-medium text-gray-700">Teleport Player</label>
          <Input
            type="text"
            placeholder="Player name..."
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">X Coordinate</label>
              <Input
                type="number"
                placeholder="X"
                value={tpX}
                onChange={(e) => setTpX(e.target.value)}
                step="0.1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Y Coordinate</label>
              <Input
                type="number"
                placeholder="Y"
                value={tpY}
                onChange={(e) => setTpY(e.target.value)}
                step="0.1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Z Coordinate</label>
              <Input
                type="number"
                placeholder="Z"
                value={tpZ}
                onChange={(e) => setTpZ(e.target.value)}
                step="0.1"
              />
            </div>
          </div>
          <Button onClick={handleTeleport} disabled={loading || !player.trim()} className="w-full">
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



