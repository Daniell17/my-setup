import { useState } from 'react';
import { Search, Package, Monitor, Lamp, Speaker, Leaf, Keyboard, Mouse, Box as BoxIcon, Coffee, Headphones, HardDrive, LayoutGrid, Armchair, BookOpen, FileText, PenTool, Smartphone, Tablet, Video, Mic, Clock, Image, Cable, MonitorSpeaker } from 'lucide-react';
import { useWorkspaceStore, ObjectType } from '@/store/workspaceStore';

interface ObjectItem {
  type: ObjectType;
  name: string;
  icon: React.ReactNode;
  category: string;
}

const objectItems: ObjectItem[] = [
  { type: 'desk', name: 'Desk', icon: <LayoutGrid className="w-5 h-5" />, category: 'Furniture' },
  { type: 'chair', name: 'Chair', icon: <Armchair className="w-5 h-5" />, category: 'Furniture' },
  { type: 'shelf', name: 'Shelf', icon: <BoxIcon className="w-5 h-5" />, category: 'Furniture' },
  { type: 'monitor', name: 'Monitor', icon: <Monitor className="w-5 h-5" />, category: 'Tech' },
  { type: 'monitor-stand', name: 'Monitor Stand', icon: <MonitorSpeaker className="w-5 h-5" />, category: 'Tech' },
  { type: 'pc-tower', name: 'PC Tower', icon: <HardDrive className="w-5 h-5" />, category: 'Tech' },
  { type: 'keyboard', name: 'Keyboard', icon: <Keyboard className="w-5 h-5" />, category: 'Tech' },
  { type: 'mouse', name: 'Mouse', icon: <Mouse className="w-5 h-5" />, category: 'Tech' },
  { type: 'headphones', name: 'Headphones', icon: <Headphones className="w-5 h-5" />, category: 'Tech' },
  { type: 'speaker', name: 'Speaker', icon: <Speaker className="w-5 h-5" />, category: 'Tech' },
  { type: 'webcam', name: 'Webcam', icon: <Video className="w-5 h-5" />, category: 'Tech' },
  { type: 'microphone', name: 'Microphone', icon: <Mic className="w-5 h-5" />, category: 'Tech' },
  { type: 'phone', name: 'Phone', icon: <Smartphone className="w-5 h-5" />, category: 'Tech' },
  { type: 'tablet', name: 'Tablet', icon: <Tablet className="w-5 h-5" />, category: 'Tech' },
  { type: 'lamp', name: 'Lamp', icon: <Lamp className="w-5 h-5" />, category: 'Accessories' },
  { type: 'plant', name: 'Plant', icon: <Leaf className="w-5 h-5" />, category: 'Accessories' },
  { type: 'mug', name: 'Coffee Mug', icon: <Coffee className="w-5 h-5" />, category: 'Accessories' },
  { type: 'books', name: 'Books', icon: <BookOpen className="w-5 h-5" />, category: 'Accessories' },
  { type: 'notebook', name: 'Notebook', icon: <FileText className="w-5 h-5" />, category: 'Accessories' },
  { type: 'pen', name: 'Pen', icon: <PenTool className="w-5 h-5" />, category: 'Accessories' },
  { type: 'clock', name: 'Clock', icon: <Clock className="w-5 h-5" />, category: 'Accessories' },
  { type: 'poster', name: 'Poster', icon: <Image className="w-5 h-5" />, category: 'Accessories' },
  { type: 'cable-tray', name: 'Cable Tray', icon: <Cable className="w-5 h-5" />, category: 'Accessories' },
];

const categories = ['All', 'Furniture', 'Tech', 'Accessories'];

export default function ObjectLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const addObject = useWorkspaceStore((state) => state.addObject);

  const filteredItems = objectItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed left-4 top-20 bottom-4 w-72 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl z-[100] flex flex-col border border-gray-800" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center gap-2 p-4 border-b border-gray-800">
        <Package className="w-5 h-5 text-cyan-400" />
        <h2 className="font-semibold text-white">Object Library</h2>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search objects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex gap-1 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Object Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No objects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.map((item) => (
              <button
                key={item.type}
                onClick={() => addObject(item.type)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-cyan-500 transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-gray-900 text-gray-400 group-hover:text-cyan-400 transition-colors">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-300 group-hover:text-cyan-400 transition-colors text-center">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

