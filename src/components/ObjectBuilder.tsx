import { useState } from 'react';
import { Plus, Box, Circle, Cylinder, Save, X, Palette } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import { api } from '@/services/api';

type GeometryType = 'box' | 'sphere' | 'cylinder';

export default function ObjectBuilder() {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const isOpen = useModalStore((state) => state.isModalOpen('objectBuilder'));
  const [objectName, setObjectName] = useState('');
  const [geometryType, setGeometryType] = useState<GeometryType>('box');
  const [dimensions, setDimensions] = useState({ width: 1, height: 1, depth: 1, radius: 0.5 });
  const [material, setMaterial] = useState({ color: '#ffffff', roughness: 0.5, metalness: 0.5 });
  const [isSaving, setIsSaving] = useState(false);

  const addObject = useWorkspaceStore((state) => state.addObject);
  const { isAuthenticated } = useAuthStore();

  const handleCreateAndAdd = () => {
    // Create a temporary object type for custom objects
    // For now, we'll use the closest matching type
    const typeMap: Record<GeometryType, string> = {
      box: 'desk', // Use desk as placeholder
      sphere: 'plant',
      cylinder: 'mug',
    };

    // Add to scene immediately
    addObject(typeMap[geometryType] as any);

    // If authenticated, save to backend
    if (isAuthenticated && objectName.trim()) {
      handleSaveToLibrary();
    }

    closeModal();
    resetForm();
  };

  const handleSaveToLibrary = async () => {
    if (!objectName.trim()) {
      alert('Please enter an object name');
      return;
    }

    setIsSaving(true);
    try {
      const geometry = {
        type: geometryType,
        args: geometryType === 'box' 
          ? [dimensions.width, dimensions.height, dimensions.depth]
          : geometryType === 'sphere'
          ? [dimensions.radius]
          : [dimensions.radius, dimensions.height],
      };

      const response = await api.request('/api/custom-objects', {
        method: 'POST',
        body: JSON.stringify({
          name: objectName.trim(),
          type: geometryType,
          geometry,
          material,
          scale: [dimensions.width, dimensions.height, dimensions.depth],
          isPublic: false,
        }),
      });

      if (response.success) {
        alert('Custom object saved to library!');
        resetForm();
      } else {
        alert('Failed to save custom object');
      }
    } catch (error) {
      console.error('Failed to save custom object:', error);
      alert('Failed to save custom object');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setObjectName('');
    setGeometryType('box');
    setDimensions({ width: 1, height: 1, depth: 1, radius: 0.5 });
    setMaterial({ color: '#ffffff', roughness: 0.5, metalness: 0.5 });
  };

  return (
    <>
      <button
        onClick={() => openModal('objectBuilder')}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2 text-sm"
        title="Create Custom Object"
      >
        <Plus className="w-4 h-4" />
        Custom
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => closeModal()}>
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-cyan-400" />
                Create Custom Object
              </h2>
              <button
                onClick={() => closeModal()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Object Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Object Name</label>
                <input
                  type="text"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  placeholder="My Custom Object"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Geometry Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Geometry Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGeometryType('box')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      geometryType === 'box'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Box className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Box</span>
                  </button>
                  <button
                    onClick={() => setGeometryType('sphere')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      geometryType === 'sphere'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Circle className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Sphere</span>
                  </button>
                  <button
                    onClick={() => setGeometryType('cylinder')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      geometryType === 'cylinder'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Cylinder className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Cylinder</span>
                  </button>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Dimensions</label>
                {geometryType === 'box' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Width</label>
                      <input
                        type="number"
                        value={dimensions.width}
                        onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 1 })}
                        min="0.1"
                        step="0.1"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Height</label>
                      <input
                        type="number"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 1 })}
                        min="0.1"
                        step="0.1"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Depth</label>
                      <input
                        type="number"
                        value={dimensions.depth}
                        onChange={(e) => setDimensions({ ...dimensions, depth: parseFloat(e.target.value) || 1 })}
                        min="0.1"
                        step="0.1"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                ) : geometryType === 'sphere' ? (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Radius</label>
                    <input
                      type="number"
                      value={dimensions.radius}
                      onChange={(e) => setDimensions({ ...dimensions, radius: parseFloat(e.target.value) || 0.5 })}
                      min="0.1"
                      step="0.1"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Radius</label>
                      <input
                        type="number"
                        value={dimensions.radius}
                        onChange={(e) => setDimensions({ ...dimensions, radius: parseFloat(e.target.value) || 0.5 })}
                        min="0.1"
                        step="0.1"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Height</label>
                      <input
                        type="number"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 1 })}
                        min="0.1"
                        step="0.1"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Material
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={material.color}
                        onChange={(e) => setMaterial({ ...material, color: e.target.value })}
                        className="w-16 h-10 rounded-lg border border-gray-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={material.color}
                        onChange={(e) => setMaterial({ ...material, color: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Roughness: {material.roughness.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={material.roughness}
                      onChange={(e) => setMaterial({ ...material, roughness: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Metalness: {material.metalness.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={material.metalness}
                      onChange={(e) => setMaterial({ ...material, metalness: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={handleCreateAndAdd}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create & Add to Scene
                </button>
                {isAuthenticated && (
                  <button
                    onClick={handleSaveToLibrary}
                    disabled={isSaving || !objectName.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save to Library'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

