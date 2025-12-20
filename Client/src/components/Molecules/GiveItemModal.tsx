/**
 * Give Item Modal Component
 * Modal with searchable Minecraft items list
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { minecraftItems, getCategories, searchItems } from '@/data/minecraft-items';
import type { MinecraftItem } from '@/data/minecraft-items';
import { useQuery } from '@tanstack/react-query';
import { getPlayers } from '@/services/minecraft';

interface GiveItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGive: (player: string, item: string, count: number) => void;
  initialPlayer?: string;
}

export default function GiveItemModal({
  open,
  onOpenChange,
  onGive,
  initialPlayer = '',
}: GiveItemModalProps) {
  const [player, setPlayer] = useState(initialPlayer);
  const [selectedItem, setSelectedItem] = useState<MinecraftItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [count, setCount] = useState(1);

  const categories = useMemo(() => ['All', ...getCategories()], []);

  // Fetch active players
  const { data: playersData } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const activePlayers = playersData?.players || [];

  const filteredItems = useMemo(() => {
    let items = minecraftItems;

    // Filter by search query first
    if (searchQuery.trim()) {
      items = searchItems(searchQuery);
    }

    // Then filter by category
    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }

    return items;
  }, [selectedCategory, searchQuery]);

  const handleGive = () => {
    if (!player.trim()) {
      return;
    }
    if (!selectedItem) {
      return;
    }
    onGive(player, selectedItem.id, count);
    setSelectedItem(null);
    setSearchQuery('');
    setCount(1);
    onOpenChange(false);
  };

  const handleItemSelect = (item: MinecraftItem) => {
    setSelectedItem(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col minecraft-card minecraft-pattern">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white pixelify-sans-bold" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>Give Item to Player</DialogTitle>
          <DialogDescription className="text-white/90 font-semibold" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
            Select an item from the list and specify the player and quantity
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Player Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Player Name</label>
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
                className="w-full minecraft-input"
              />
            )}
          </div>

          {/* Search and Category Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Search Items</label>
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="minecraft-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white font-bold pixelify-sans" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 minecraft-select rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Item Display */}
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="minecraft-card-light minecraft-pattern rounded-lg p-3 border-2 border-[#7CB342]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>{selectedItem.name}</p>
                  <p className="text-sm text-white/90" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>{selectedItem.id}</p>
                  <p className="text-xs text-white/80" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>{selectedItem.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-white font-bold pixelify-sans" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>Count:</label>
                  <Input
                    type="number"
                    min="1"
                    max="64"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(64, parseInt(e.target.value) || 1)))}
                    className="w-20 minecraft-input"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="text-sm font-medium text-white font-bold mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              {filteredItems.length} items found
            </div>
            <div className="flex-1 overflow-y-auto border-2 border-[#5A4A3A] rounded-lg minecraft-card-light minecraft-pattern">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                {filteredItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      selectedItem?.id === item.id
                        ? 'minecraft-card border-[#7CB342] shadow-lg'
                        : 'minecraft-card-light hover:border-[#7CB342] hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="font-medium text-sm text-white font-bold" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>{item.name}</p>
                    <p className="text-xs mt-1 text-white/80" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      {item.category}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedItem(null);
              setSearchQuery('');
              setCount(1);
            }}
            className="minecraft-button-light border-2 border-[#5A4A3A]"
            style={{ background: 'linear-gradient(145deg, #6B5B47 0%, #5A4A3A 100%)', color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGive}
            disabled={!player.trim() || !selectedItem}
            className="minecraft-button disabled:opacity-50"
          >
            Give Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

