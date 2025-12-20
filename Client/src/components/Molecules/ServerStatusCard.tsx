/**
 * Molecule: ServerStatusCard
 * Display server status and information
 */
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getServerInfo, getServerStatus, getPlayers } from '@/services/minecraft';
import { Badge } from '../ui/badge';

export default function ServerStatusCard() {
  const { data: serverInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['serverInfo'],
    queryFn: getServerInfo,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: serverStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['serverStatus'],
    queryFn: getServerStatus,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const { data: players, isLoading: loadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const loading = loadingInfo || loadingStatus || loadingPlayers;

  return (
    <motion.div
      className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🎮 Server Status</h2>
        {serverStatus && (
          <Badge variant={serverStatus.online ? 'default' : 'destructive'}>
            {serverStatus.online ? '🟢 Online' : '🔴 Offline'}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* Server Info */}
          {serverInfo && (
            <div className="bg-white/40 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">IP:</span>
                <span className="text-gray-800 font-semibold">{serverInfo.ip}:{serverInfo.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">MOTD:</span>
                <span className="text-gray-800 font-semibold">{serverInfo.motd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Online Mode:</span>
                <Badge variant={serverInfo.onlineMode ? 'default' : 'secondary'}>
                  {serverInfo.onlineMode ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          )}

          {/* Players */}
          {players && (
            <div className="bg-white/40 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Players:</span>
                <Badge>{players.online}/{players.max}</Badge>
              </div>
              {players.players.length > 0 && (
                <div className="mt-2 space-y-1">
                  {players.players.map((player, idx) => (
                    <div key={idx} className="text-sm text-gray-700 bg-white/30 rounded-xl px-3 py-1">
                      👤 {player}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}


