import { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Settings, Trash2, Copy, RotateCcw, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyCenter, Layers, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function PropertiesPanel() {
  const selectedId = useWorkspaceStore((state) => state.selectedId);
  const selectedIds = useWorkspaceStore((state) => state.selectedIds);
  const objects = useWorkspaceStore((state) => state.objects);
  const updateObject = useWorkspaceStore((state) => state.updateObject);
  const removeObject = useWorkspaceStore((state) => state.removeObject);
  const duplicateObject = useWorkspaceStore((state) => state.duplicateObject);
  const clearSelection = useWorkspaceStore((state) => state.clearSelection);
  const alignObjects = useWorkspaceStore((state) => state.alignObjects);
  const distributeObjects = useWorkspaceStore((state) => state.distributeObjects);
  const autoStack = useWorkspaceStore((state) => state.autoStack);
  const groupObjects = useWorkspaceStore((state) => state.groupObjects);
  const ungroupObjects = useWorkspaceStore((state) => state.ungroupObjects);

  const [expandedSections, setExpandedSections] = useState({
    transform: true,
    dimensions: false,
    material: false,
  });

  const selectedObject = objects.find((obj) => obj.id === selectedId);

  if (!selectedObject && selectedIds.length === 0) {
    return null;
  }

  const isMultiSelect = selectedIds.length > 1;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePositionChange = (axis: 0 | 1 | 2, value: number) => {
    if (!selectedObject) return;
    const newPosition = [...selectedObject.position] as [number, number, number];
    newPosition[axis] = value;
    updateObject(selectedId!, { position: newPosition });
  };

  const handleRotationChange = (axis: 0 | 1 | 2, value: number) => {
    if (!selectedObject) return;
    const newRotation = [...selectedObject.rotation] as [number, number, number];
    newRotation[axis] = (value * Math.PI) / 180;
    updateObject(selectedId!, { rotation: newRotation });
  };

  const handleScaleChange = (value: number) => {
    if (!selectedObject) return;
    const ratio = value / selectedObject.scale[0];
    const newScale = selectedObject.scale.map((s) => s * ratio) as [number, number, number];
    updateObject(selectedId!, { scale: newScale });
  };

  const handleReset = () => {
    if (!selectedObject) return;
    updateObject(selectedId!, {
      position: [0, selectedObject.scale[1] / 2, 0],
      rotation: [0, 0, 0],
    });
  };

  return (
    <div className="fixed right-4 top-20 bottom-6 w-80 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 z-[100] flex flex-col max-h-[calc(100vh-6rem)] overflow-y-auto" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center justify-between p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="font-semibold text-white text-base">
            {isMultiSelect ? `Properties (${selectedIds.length})` : 'Properties'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {isMultiSelect && (
            <button
              onClick={clearSelection}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={clearSelection}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Close Properties"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {isMultiSelect ? (
          <div className="space-y-5">
            <div className="text-center py-6 text-gray-400 text-sm">
              <p className="font-medium">{selectedIds.length} objects selected</p>
              <p className="text-xs mt-2 text-gray-500">Select a single object to edit properties</p>
            </div>

            {/* Alignment Tools */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-3 block">Align X</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => alignObjects('x', 'min')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => alignObjects('x', 'center')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Center X"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => alignObjects('x', 'max')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium mb-3 block">Align Y</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => alignObjects('y', 'min')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Bottom"
                  >
                    <AlignLeft className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  <button
                    onClick={() => alignObjects('y', 'center')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Center Y"
                  >
                    <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => alignObjects('y', 'max')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Top"
                  >
                    <AlignRight className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium mb-3 block">Align Z</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => alignObjects('z', 'min')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Back"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => alignObjects('z', 'center')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Center Z"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => alignObjects('z', 'max')}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                    title="Align Front"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Distribute */}
              {selectedIds.length >= 3 && (
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-3 block">Distribute</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => distributeObjects('x')}
                      className="flex-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                      title="Distribute X"
                    >
                      X
                    </button>
                    <button
                      onClick={() => distributeObjects('y')}
                      className="flex-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                      title="Distribute Y"
                    >
                      Y
                    </button>
                    <button
                      onClick={() => distributeObjects('z')}
                      className="flex-1 px-3 py-2.5 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                      title="Distribute Z"
                    >
                      Z
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-800 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => groupObjects(selectedIds)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                  >
                    <Layers className="w-4 h-4" />
                    Group
                  </button>
                  <button
                    onClick={() => ungroupObjects(selectedIds)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                  >
                    <Layers className="w-4 h-4" />
                    Ungroup
                  </button>
                </div>
                <button
                  onClick={() => {
                    selectedIds.forEach((id) => removeObject(id));
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All ({selectedIds.length})
                </button>
              </div>
            </div>
          </div>
        ) : selectedObject ? (
          <>
            {/* Object Name & Price */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-2 block">Name</label>
                <input
                  value={selectedObject.name}
                  onChange={(e) => updateObject(selectedId!, { name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium mb-2 block">Price ($)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="10"
                    value={selectedObject.price || 0}
                    onChange={(e) => updateObject(selectedId!, { price: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500"
                  />
                  <input
                    type="number"
                    min="0"
                    value={selectedObject.price || 0}
                    onChange={(e) => updateObject(selectedId!, { price: parseFloat(e.target.value) || 0 })}
                    className="w-20 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-xs text-gray-400 font-medium mb-2 block">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedObject.color}
                  onChange={(e) => updateObject(selectedId!, { color: e.target.value })}
                  className="w-12 h-12 rounded-lg border border-gray-700 cursor-pointer bg-gray-800"
                />
                <input
                  value={selectedObject.color}
                  onChange={(e) => updateObject(selectedId!, { color: e.target.value })}
                  className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-mono text-white"
                />
              </div>
            </div>

            {/* Transform Section - Always Expanded */}
            <div className="pt-2 border-t border-gray-800">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Transform</h3>
                
                {/* Position */}
                <div className="mb-4 space-y-3">
                  <label className="text-xs text-gray-400 font-medium mb-2 block">Position</label>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-mono">{axis}</span>
                        <span className="text-xs text-gray-400 font-mono">
                          {selectedObject.position[i].toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          step="0.1"
                          value={selectedObject.position[i]}
                          onChange={(e) => handlePositionChange(i as 0 | 1 | 2, parseFloat(e.target.value))}
                          className="flex-1 accent-cyan-500"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={selectedObject.position[i].toFixed(2)}
                          onChange={(e) => handlePositionChange(i as 0 | 1 | 2, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rotation */}
                <div className="mb-4 space-y-3">
                  <label className="text-xs text-gray-400 font-medium mb-2 block">Rotation</label>
                  {['X', 'Y', 'Z'].map((axis, i) => {
                    const degrees = (selectedObject.rotation[i] * 180) / Math.PI;
                    return (
                      <div key={axis}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500 font-mono">{axis}</span>
                          <span className="text-xs text-gray-400 font-mono">
                            {degrees.toFixed(0)}°
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            value={degrees}
                            onChange={(e) => handleRotationChange(i as 0 | 1 | 2, parseFloat(e.target.value))}
                            className="flex-1 accent-cyan-500"
                          />
                          <input
                            type="number"
                            min="0"
                            max="360"
                            step="1"
                            value={degrees.toFixed(0)}
                            onChange={(e) => handleRotationChange(i as 0 | 1 | 2, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Scale */}
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-2 block">Scale</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={selectedObject.scale[0]}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                      className="flex-1 accent-cyan-500"
                    />
                    <input
                      type="number"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={selectedObject.scale[0].toFixed(1)}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value) || 0.1)}
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dimensions Section - Collapsible */}
            {selectedObject.dimensions && (
              <div className="pt-2 border-t border-gray-800">
                <button
                  onClick={() => toggleSection('dimensions')}
                  className="w-full flex items-center justify-between mb-3 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  <span>Dimensions</span>
                  {expandedSections.dimensions ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedSections.dimensions && (
                  <div className="space-y-4">
                    {selectedObject.dimensions.width !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Width</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.05"
                            value={selectedObject.dimensions.width}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                dimensions: {
                                  ...selectedObject.dimensions,
                                  width: parseFloat(e.target.value),
                                },
                              });
                            }}
                            className="flex-1 accent-cyan-500"
                          />
                          <input
                            type="number"
                            min="0.1"
                            max="5"
                            step="0.05"
                            value={selectedObject.dimensions.width.toFixed(2)}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                dimensions: {
                                  ...selectedObject.dimensions,
                                  width: parseFloat(e.target.value) || 0.1,
                                },
                              });
                            }}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    )}
                    {selectedObject.dimensions.height !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Height</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0.01"
                            max="5"
                            step="0.05"
                            value={selectedObject.dimensions.height}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                dimensions: {
                                  ...selectedObject.dimensions,
                                  height: parseFloat(e.target.value),
                                },
                              });
                            }}
                            className="flex-1 accent-cyan-500"
                          />
                          <input
                            type="number"
                            min="0.01"
                            max="5"
                            step="0.05"
                            value={selectedObject.dimensions.height.toFixed(2)}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                dimensions: {
                                  ...selectedObject.dimensions,
                                  height: parseFloat(e.target.value) || 0.01,
                                },
                              });
                            }}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    )}
                    {selectedObject.dimensions.depth !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Depth</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0.01"
                            max="5"
                            step="0.05"
                            value={selectedObject.dimensions.depth}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                dimensions: {
                                  ...selectedObject.dimensions,
                                  depth: parseFloat(e.target.value),
                                },
                              });
                            }}
                            className="flex-1 accent-cyan-500"
                          />
                          <input
                            type="number"
                            min="0.01"
                            max="5"
                            step="0.05"
                            value={selectedObject.dimensions.depth.toFixed(2)}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                dimensions: {
                                  ...selectedObject.dimensions,
                                  depth: parseFloat(e.target.value) || 0.01,
                                },
                              });
                            }}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    )}
                    {selectedObject.dimensions.radius !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Radius</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0.01"
                            max="1"
                            step="0.01"
                            value={selectedObject.dimensions.radius}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                dimensions: {
                                  ...selectedObject.dimensions,
                                  radius: parseFloat(e.target.value),
                                },
                              });
                            }}
                            className="flex-1 accent-cyan-500"
                          />
                          <input
                            type="number"
                            min="0.01"
                            max="1"
                            step="0.01"
                            value={selectedObject.dimensions.radius.toFixed(2)}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                dimensions: {
                                  ...selectedObject.dimensions,
                                  radius: parseFloat(e.target.value) || 0.01,
                                },
                              });
                            }}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Material Section - Collapsible */}
            <div className="pt-2 border-t border-gray-800">
              <button
                onClick={() => toggleSection('material')}
                className="w-full flex items-center justify-between mb-3 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                <span>Material</span>
                {expandedSections.material ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedSections.material && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {['standard', 'wood', 'metal', 'plastic', 'fabric', 'glass'].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateObject(selectedId!, {
                          material: {
                            ...selectedObject.material,
                            type: type as any,
                          }
                        })}
                        className={`px-2 py-2 text-xs rounded-lg capitalize transition-colors border ${
                          selectedObject.material?.type === type
                            ? 'bg-cyan-500 text-white border-cyan-600'
                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {selectedObject.properties && (
                    <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Roughness</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={selectedObject.properties.roughness ?? 0.5}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                properties: {
                                  ...selectedObject.properties,
                                  roughness: parseFloat(e.target.value),
                                },
                              });
                            }}
                            className="flex-1 accent-cyan-500"
                          />
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={(selectedObject.properties.roughness ?? 0.5).toFixed(2)}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                properties: {
                                  ...selectedObject.properties,
                                  roughness: parseFloat(e.target.value) || 0,
                                },
                              });
                            }}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Metalness</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={selectedObject.properties.metalness ?? 0.5}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                properties: {
                                  ...selectedObject.properties,
                                  metalness: parseFloat(e.target.value),
                                },
                              });
                            }}
                            className="flex-1 accent-cyan-500"
                          />
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={(selectedObject.properties.metalness ?? 0.5).toFixed(2)}
                            onChange={(e) => {
                              updateObject(selectedId!, {
                                properties: {
                                  ...selectedObject.properties,
                                  metalness: parseFloat(e.target.value) || 0,
                                },
                              });
                            }}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                      {selectedObject.material?.type === 'glass' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Opacity</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={selectedObject.properties.opacity ?? 0.5}
                              onChange={(e) => {
                                updateObject(selectedId!, {
                                  properties: {
                                    ...selectedObject.properties,
                                    opacity: parseFloat(e.target.value),
                                    transparent: true,
                                  },
                                });
                              }}
                              className="flex-1 accent-cyan-500"
                            />
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.05"
                              value={(selectedObject.properties.opacity ?? 0.5).toFixed(2)}
                              onChange={(e) => {
                                updateObject(selectedId!, {
                                  properties: {
                                    ...selectedObject.properties,
                                    opacity: parseFloat(e.target.value) || 0,
                                    transparent: true,
                                  },
                                });
                              }}
                              className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => duplicateObject(selectedId!)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
              {(selectedObject.type === 'pc-tower' || selectedObject.type === 'speaker' || selectedObject.type === 'monitor-stand' || selectedObject.type === 'cable-tray') && (
                <button
                  onClick={() => autoStack(selectedId!)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors border border-cyan-500/50"
                >
                  <Layers className="w-4 h-4" />
                  Auto-Stack
                </button>
              )}
              <button
                onClick={() => removeObject(selectedId!)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Object
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
