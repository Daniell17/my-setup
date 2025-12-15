import { useState, useMemo } from 'react';
import { Search, Package, Monitor, Lamp, Speaker, Leaf, Keyboard, Mouse, Box as BoxIcon, Coffee, Headphones, HardDrive, LayoutGrid, Armchair, BookOpen, FileText, PenTool, Smartphone, Tablet, Video, Mic, Clock, Image, Cable, MonitorSpeaker, X, Filter, Star, Upload } from 'lucide-react';
import { useWorkspaceStore, ObjectType } from '@/store/workspaceStore';
import ObjectBuilder from './ObjectBuilder';

interface ObjectItem {
  type: ObjectType;
  name: string;
  icon: React.ReactNode;
  category: string;
  subcategory?: string;
  tags?: string[];
  price?: number;
  popularity?: number;
}

const objectItems: ObjectItem[] = [
  { type: 'desk', name: 'Desk', icon: <LayoutGrid className="w-5 h-5" />, category: 'Furniture', subcategory: 'Desks', tags: ['workspace', 'essential'], price: 200, popularity: 10 },
  { type: 'chair', name: 'Chair', icon: <Armchair className="w-5 h-5" />, category: 'Furniture', subcategory: 'Chairs', tags: ['ergonomic', 'comfort'], price: 400, popularity: 9 },
  { type: 'shelf', name: 'Shelf', icon: <BoxIcon className="w-5 h-5" />, category: 'Furniture', subcategory: 'Storage', tags: ['storage', 'organization'], price: 150, popularity: 6 },
  { type: 'monitor', name: 'Monitor', icon: <Monitor className="w-5 h-5" />, category: 'Tech', subcategory: 'Displays', tags: ['display', 'essential'], price: 300, popularity: 10 },
  { type: 'monitor-stand', name: 'Monitor Stand', icon: <MonitorSpeaker className="w-5 h-5" />, category: 'Tech', subcategory: 'Accessories', tags: ['ergonomic', 'stand'], price: 50, popularity: 5 },
  { type: 'pc-tower', name: 'PC Tower', icon: <HardDrive className="w-5 h-5" />, category: 'Tech', subcategory: 'Computers', tags: ['computer', 'gaming'], price: 1500, popularity: 8 },
  { type: 'keyboard', name: 'Keyboard', icon: <Keyboard className="w-5 h-5" />, category: 'Tech', subcategory: 'Input', tags: ['input', 'essential'], price: 100, popularity: 9 },
  { type: 'mouse', name: 'Mouse', icon: <Mouse className="w-5 h-5" />, category: 'Tech', subcategory: 'Input', tags: ['input', 'essential'], price: 50, popularity: 9 },
  { type: 'headphones', name: 'Headphones', icon: <Headphones className="w-5 h-5" />, category: 'Tech', subcategory: 'Audio', tags: ['audio', 'gaming'], price: 200, popularity: 7 },
  { type: 'speaker', name: 'Speaker', icon: <Speaker className="w-5 h-5" />, category: 'Tech', subcategory: 'Audio', tags: ['audio', 'music'], price: 150, popularity: 6 },
  { type: 'webcam', name: 'Webcam', icon: <Video className="w-5 h-5" />, category: 'Tech', subcategory: 'Video', tags: ['video', 'streaming'], price: 80, popularity: 5 },
  { type: 'microphone', name: 'Microphone', icon: <Mic className="w-5 h-5" />, category: 'Tech', subcategory: 'Audio', tags: ['audio', 'streaming'], price: 120, popularity: 6 },
  { type: 'phone', name: 'Phone', icon: <Smartphone className="w-5 h-5" />, category: 'Tech', subcategory: 'Mobile', tags: ['mobile', 'communication'], price: 800, popularity: 4 },
  { type: 'tablet', name: 'Tablet', icon: <Tablet className="w-5 h-5" />, category: 'Tech', subcategory: 'Mobile', tags: ['mobile', 'display'], price: 500, popularity: 4 },
  { type: 'lamp', name: 'Lamp', icon: <Lamp className="w-5 h-5" />, category: 'Accessories', subcategory: 'Lighting', tags: ['lighting', 'ambiance'], price: 40, popularity: 5 },
  { type: 'plant', name: 'Plant', icon: <Leaf className="w-5 h-5" />, category: 'Accessories', subcategory: 'Decoration', tags: ['decoration', 'nature'], price: 30, popularity: 4 },
  { type: 'mug', name: 'Coffee Mug', icon: <Coffee className="w-5 h-5" />, category: 'Accessories', subcategory: 'Drinkware', tags: ['drinkware', 'comfort'], price: 15, popularity: 3 },
  { type: 'books', name: 'Books', icon: <BookOpen className="w-5 h-5" />, category: 'Accessories', subcategory: 'Decoration', tags: ['decoration', 'knowledge'], price: 20, popularity: 3 },
  { type: 'notebook', name: 'Notebook', icon: <FileText className="w-5 h-5" />, category: 'Accessories', subcategory: 'Stationery', tags: ['stationery', 'writing'], price: 10, popularity: 2 },
  { type: 'pen', name: 'Pen', icon: <PenTool className="w-5 h-5" />, category: 'Accessories', subcategory: 'Stationery', tags: ['stationery', 'writing'], price: 5, popularity: 2 },
  { type: 'clock', name: 'Clock', icon: <Clock className="w-5 h-5" />, category: 'Accessories', subcategory: 'Decoration', tags: ['decoration', 'time'], price: 25, popularity: 3 },
  { type: 'poster', name: 'Poster', icon: <Image className="w-5 h-5" />, category: 'Accessories', subcategory: 'Decoration', tags: ['decoration', 'art'], price: 20, popularity: 2 },
  { type: 'cable-tray', name: 'Cable Tray', icon: <Cable className="w-5 h-5" />, category: 'Accessories', subcategory: 'Organization', tags: ['organization', 'cables'], price: 30, popularity: 4 },
];

const categories = ['All', 'Furniture', 'Tech', 'Accessories'];
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'popularity', label: 'Popularity' },
];

export default function ObjectLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  
  const addObject = useWorkspaceStore((state) => state.addObject);

  // Get unique subcategories and tags
  const subcategories = useMemo(() => {
    const subs = new Set<string>();
    objectItems.forEach(item => {
      if (item.subcategory) subs.add(item.subcategory);
    });
    return Array.from(subs).sort();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    objectItems.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  // Filter and sort objects
  const filteredItems = useMemo(() => {
    let filtered = objectItems.filter((item) => {
      // Search query
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      
      // Subcategory
      const matchesSubcategory = !selectedSubcategory || item.subcategory === selectedSubcategory;
      
      // Tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => item.tags?.includes(tag));
      
      // Price range
      const price = item.price || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesTags && matchesPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, activeCategory, selectedSubcategory, selectedTags, priceRange, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const maxPrice = Math.max(...objectItems.map(item => item.price || 0));

  const handleAddExternalModel = () => {
    if (!externalUrl) return;
    // Use 'shelf' as a generic container for now, or add a specific 'custom' type if needed. 
    // Using 'shelf' because it's a simple object. 
    // Ideally we should have a 'custom' type in ObjectType but I didn't add it to the list in this PR.
    // 'desk' is also fine, or 'box' if I had it. 
    // Let's use 'shelf' and override the name.
    addObject('shelf', { 
      name: 'External Model', 
      modelUrl: externalUrl,
      scale: [1, 1, 1] // Reset scale for imported models
    });
    setExternalUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className="fixed left-4 top-20 bottom-4 w-80 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl z-[100] flex flex-col border border-gray-800 overflow-hidden" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center justify-between p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-cyan-400" />
          <h2 className="font-semibold text-white">Object Library</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`p-1.5 rounded-lg transition-colors ${
              showUrlInput ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-gray-800'
            }`}
            title="Add GLTF/GLB from URL"
          >
            <Upload className="w-4 h-4" />
          </button>
          <ObjectBuilder />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-gray-800'
            }`}
            title="Toggle Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URL Input Panel */}
      {showUrlInput && (
        <div className="px-5 py-4 border-b border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste GLTF/GLB URL..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs text-white"
            />
            <button
              onClick={handleAddExternalModel}
              disabled={!externalUrl}
              className="px-3 py-2 bg-cyan-500 text-white rounded-lg text-xs font-medium hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-[10px] text-gray-500">
            Supports .gltf and .glb files. Ensure CORS is enabled on the server hosting the file.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search objects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-white placeholder-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="flex gap-1 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setSelectedSubcategory(null);
              }}
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

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-5 py-4 border-b border-gray-800 space-y-4 max-h-64 overflow-y-auto">
          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Subcategory</label>
              <select
                value={selectedSubcategory || ''}
                onChange={(e) => setSelectedSubcategory(e.target.value || null)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All</option>
                {subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Price: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Tags</label>
            <div className="flex flex-wrap gap-1">
              {allTags.slice(0, 8).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Object Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No objects found</p>
            <p className="text-xs text-gray-600 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-400 mb-3">
              {filteredItems.length} {filteredItems.length === 1 ? 'object' : 'objects'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addObject(item.type)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-cyan-500 transition-all duration-200 group relative"
                >
                  <div className="p-2 rounded-lg bg-gray-900 text-gray-400 group-hover:text-cyan-400 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-300 group-hover:text-cyan-400 transition-colors text-center">
                    {item.name}
                  </span>
                  {item.price !== undefined && (
                    <span className="text-[10px] text-gray-500">${item.price}</span>
                  )}
                  {item.popularity && item.popularity >= 8 && (
                    <div className="absolute top-1 right-1 text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
