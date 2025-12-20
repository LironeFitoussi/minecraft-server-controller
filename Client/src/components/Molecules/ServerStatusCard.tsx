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
      className="minecraft-card minecraft-pattern rounded-lg p-6 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white drop-shadow-lg pixelify-sans-bold" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>🎮 Server Status</h2>
        {serverStatus && (
          <Badge variant={serverStatus.online ? 'default' : 'destructive'}>
            {serverStatus.online ? '🟢 Online' : '🔴 Offline'}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="text-white font-bold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* Server Info */}
          {serverInfo && (
            <div className="minecraft-card-light minecraft-pattern rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>IP:</span>
                <span className="text-white font-semibold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>{serverInfo.ip}:{serverInfo.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>MOTD:</span>
                <span className="text-white font-semibold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>{serverInfo.motd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Online Mode:</span>
                <Badge variant={serverInfo.onlineMode ? 'default' : 'secondary'}>
                  {serverInfo.onlineMode ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          )}

          {/* Players */}
          {players && (
            <div className="minecraft-card-light minecraft-pattern rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Players:</span>
                <Badge>{players.online}/{players.max}</Badge>
              </div>
              {players.players.length > 0 && (
                <div className="mt-2 space-y-1">
                  {players.players.map((player, idx) => (
                    <div key={idx} className="text-sm text-white font-semibold minecraft-card rounded-lg px-3 py-2 pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
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



