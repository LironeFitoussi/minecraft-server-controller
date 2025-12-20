/**
 * Page: ServerStatsPage
 * Display comprehensive server machine statistics
 */
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getSystemStats } from '@/services/minecraft';

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Progress bar component
const ProgressBar = ({ value, max, label, color = 'bg-green-500' }: { value: number; max: number; label: string; color?: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-white font-semibold pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
          {label}
        </span>
        <span className="text-white font-bold pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-[#5A4A3A] rounded-full h-4 border-2 border-[#3D2F1F] overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)' }}
        />
      </div>
    </div>
  );
};

// Stat card component
const StatCard = ({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle?: string; icon: string }) => (
  <motion.div
    className="minecraft-card minecraft-pattern rounded-lg p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="text-lg font-bold text-white pixelify-sans-bold mb-1" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
          {title}
        </h3>
        <p className="text-2xl font-bold text-white pixelify-sans-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-white/80 pixelify-sans mt-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  </motion.div>
);

export default function ServerStatsPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['systemStats'],
    queryFn: getSystemStats,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="w-full px-6 py-8 flex items-center justify-center min-h-screen">
        <div className="text-white pixelify-sans-bold text-2xl" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
          Loading system stats...
        </div>
      </div>
    );
  }

  if (error || !stats?.success) {
    return (
      <div className="w-full px-6 py-8 flex items-center justify-center min-h-screen">
        <div className="minecraft-card-light minecraft-pattern rounded-lg p-6 text-center">
          <p className="text-white pixelify-sans-bold text-xl" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
            Failed to load system stats
          </p>
        </div>
      </div>
    );
  }

  const { cpu, memory, disk, network, system } = stats.data;

  return (
    <div className="w-full px-6 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-5xl font-bold text-white pixelify-sans-bold drop-shadow-lg mb-2" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
            📊 Server Statistics
          </h1>
          <p className="text-xl text-white pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
            Real-time system resource monitoring and metrics
          </p>
        </motion.div>

        {/* System Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Hostname"
            value={system.hostname}
            icon="🖥️"
          />
          <StatCard
            title="Platform"
            value={system.platform}
            subtitle={system.arch}
            icon="💻"
          />
          <StatCard
            title="Uptime"
            value={system.uptime.formatted}
            icon="⏱️"
          />
          <StatCard
            title="Node.js"
            value={system.nodeVersion}
            icon="🟢"
          />
        </div>

        {/* CPU Stats */}
        <motion.div
          className="minecraft-card minecraft-pattern rounded-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-white pixelify-sans-bold mb-4" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>
            🔧 CPU Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="minecraft-card-light minecraft-pattern rounded-lg p-4">
                <p className="text-white/90 pixelify-sans text-sm mb-2" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                  <strong className="pixelify-sans-bold">Model:</strong> {cpu.model}
                </p>
                <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                  <strong className="pixelify-sans-bold">Cores:</strong> {cpu.cores}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white font-semibold pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                  Load Average: {cpu.loadAverage.map(l => l.toFixed(2)).join(', ')}
                </p>
              </div>
            </div>
            <div>
              <ProgressBar
                value={cpu.usage}
                max={100}
                label="CPU Usage"
                color={cpu.usage > 80 ? 'bg-red-500' : cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}
              />
            </div>
          </div>
        </motion.div>

        {/* Memory Stats */}
        <motion.div
          className="minecraft-card minecraft-pattern rounded-lg p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white pixelify-sans-bold mb-4" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>
            💾 Memory Usage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="minecraft-card-light minecraft-pattern rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/90 pixelify-sans text-xs mb-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      Total
                    </p>
                    <p className="text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      {formatBytes(memory.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/90 pixelify-sans text-xs mb-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      Free
                    </p>
                    <p className="text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      {formatBytes(memory.free)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/90 pixelify-sans text-xs mb-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      Used
                    </p>
                    <p className="text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      {formatBytes(memory.used)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/90 pixelify-sans text-xs mb-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      Usage
                    </p>
                    <p className="text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      {memory.usagePercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <ProgressBar
                value={memory.usagePercent}
                max={100}
                label="Memory Usage"
                color={memory.usagePercent > 80 ? 'bg-red-500' : memory.usagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'}
              />
            </div>
          </div>
        </motion.div>

        {/* Disk Stats */}
        {disk.total > 0 && (
          <motion.div
            className="minecraft-card minecraft-pattern rounded-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white pixelify-sans-bold mb-4" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>
              💿 Disk Usage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="minecraft-card-light minecraft-pattern rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/90 pixelify-sans text-xs mb-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                        Total
                      </p>
                      <p className="text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                        {disk.total} GB
                      </p>
                    </div>
                    <div>
                      <p className="text-white/90 pixelify-sans text-xs mb-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                        Used
                      </p>
                      <p className="text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                        {disk.used} GB
                      </p>
                    </div>
                    <div>
                      <p className="text-white/90 pixelify-sans text-xs mb-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                        Free
                      </p>
                      <p className="text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                        {disk.free} GB
                      </p>
                    </div>
                    <div>
                      <p className="text-white/90 pixelify-sans text-xs mb-1" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                        Usage
                      </p>
                      <p className="text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                        {disk.percent}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <ProgressBar
                  value={disk.percent}
                  max={100}
                  label="Disk Usage"
                  color={disk.percent > 80 ? 'bg-red-500' : disk.percent > 60 ? 'bg-yellow-500' : 'bg-green-500'}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Network Stats */}
        <motion.div
          className="minecraft-card minecraft-pattern rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white pixelify-sans-bold mb-4" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>
            🌐 Network Interfaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(network).map(([iface, addresses]) => (
              <div key={iface} className="minecraft-card-light minecraft-pattern rounded-lg p-4">
                <h3 className="text-lg font-bold text-white pixelify-sans-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                  {iface}
                </h3>
                {Array.isArray(addresses) && addresses.map((addr, idx) => (
                  <div key={idx} className="space-y-1 mb-2">
                    {addr.family === 'IPv4' && !addr.internal && (
                      <>
                        <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                          <strong>IP:</strong> {addr.address}
                        </p>
                        <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                          <strong>Netmask:</strong> {addr.netmask}
                        </p>
                        {addr.mac && (
                          <p className="text-white/90 pixelify-sans text-sm" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                            <strong>MAC:</strong> {addr.mac}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

