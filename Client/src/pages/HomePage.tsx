import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function HomePage() {
  return (
    <div className="w-full px-6 py-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="text-center space-y-8 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold text-white pixelify-sans-bold drop-shadow-lg mb-4" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
            🎮 Minecraft Server Controller
          </h1>
          <p className="text-2xl text-white pixelify-sans max-w-3xl mx-auto mb-6" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
            Professional web dashboard for managing your Minecraft server remotely
          </p>
          <Link to="/minecraft">
            <Button className="minecraft-button pixelify-sans text-lg px-8 py-4">
              🚀 Launch Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            className="minecraft-card minecraft-pattern rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-xl font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              Player Management
            </h3>
            <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
              Manage players, set game modes, teleport, give items, and control permissions
            </p>
          </motion.div>

          <motion.div
            className="minecraft-card minecraft-pattern rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-4xl mb-3">🌍</div>
            <h3 className="text-xl font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              World Control
            </h3>
            <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
              Control weather, time, difficulty, and game rules with one click
            </p>
          </motion.div>

          <motion.div
            className="minecraft-card minecraft-pattern rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              Quick Actions
            </h3>
            <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
              Broadcast messages, save world, give items, and control server status
            </p>
          </motion.div>

          <motion.div
            className="minecraft-card minecraft-pattern rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              Real-time Status
            </h3>
            <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
              Monitor server status, online players, and server information in real-time
            </p>
          </motion.div>

          <motion.div
            className="minecraft-card minecraft-pattern rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="text-xl font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              Item Management
            </h3>
            <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
              Browse and give any Minecraft item with searchable item database
            </p>
          </motion.div>

          <motion.div
            className="minecraft-card minecraft-pattern rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="text-xl font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              Server Control
            </h3>
            <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
              Start, stop, and restart your Minecraft server directly from the dashboard
            </p>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          className="minecraft-card-light minecraft-pattern rounded-lg p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-white pixelify-sans-bold mb-6 text-center" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>
            🛠️ How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-lg font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                Connect via RCON
              </h3>
              <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                The dashboard connects to your Minecraft server using RCON protocol
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-lg font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                Control Your Server
              </h3>
              <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                Use the intuitive interface to manage players, world, and server settings
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-lg font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                Monitor & Manage
              </h3>
              <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                Real-time monitoring and instant command execution for full server control
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const HomePageLoader = () => {
  return {
    message: "Minecraft Server Controller",
  };
};
