/**
 * Page: MinecraftDashboardPage
 * Main Minecraft server control dashboard
 */
import { motion } from 'framer-motion';
import ServerStatusCard from '@/components/Molecules/ServerStatusCard';
import GameModeControl from '@/components/Molecules/GameModeControl';
import QuickActionsPanel from '@/components/Molecules/QuickActionsPanel';

export default function MinecraftDashboardPage() {
  return (
    <div className="w-full px-6 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg pixelify-sans-bold" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
          🎮 Minecraft Server Controller
        </h1>
        <p className="text-white font-semibold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
          Manage your Minecraft server with ease
        </p>
      </motion.div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Server Status & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <ServerStatusCard />
          <QuickActionsPanel />
        </div>

        {/* Right Column - Game Controls */}
        <div className="lg:col-span-2">
          <GameModeControl />
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        className="mt-8 minecraft-card-light minecraft-pattern rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-2 font-bold pixelify-sans-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>ℹ️ Getting Started</h3>
        <ul className="text-sm text-white space-y-1 font-semibold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
          <li>• <strong>Game Mode:</strong> Select a player and click a game mode button</li>
          <li>• <strong>Quick Actions:</strong> Use the left panel for common commands</li>
          <li>• <strong>Weather & Time:</strong> Control the server environment with one click</li>
          <li>• <strong>Broadcast:</strong> Send messages to all online players</li>
        </ul>
      </motion.div>
    </div>
  );
}



