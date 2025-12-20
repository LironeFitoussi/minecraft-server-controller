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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Give Item to Player</DialogTitle>
          <DialogDescription>
            Select an item from the list and specify the player and quantity
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Player Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Player Name</label>
            <Input
              type="text"
              placeholder="Enter player name..."
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Search and Category Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Items</label>
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">{selectedItem.name}</p>
                  <p className="text-sm text-blue-700">{selectedItem.id}</p>
                  <p className="text-xs text-blue-600">{selectedItem.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Count:</label>
                  <Input
                    type="number"
                    min="1"
                    max="64"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(64, parseInt(e.target.value) || 1)))}
                    className="w-20"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="text-sm font-medium text-gray-700 mb-2">
              {filteredItems.length} items found
            </div>
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                {filteredItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedItem?.id === item.id
                        ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                        : 'bg-white/80 hover:bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className={`text-xs mt-1 ${
                      selectedItem?.id === item.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
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
          >
            Cancel
          </Button>
          <Button
            onClick={handleGive}
            disabled={!player.trim() || !selectedItem}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Give Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

