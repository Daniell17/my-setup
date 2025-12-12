import { Move, RotateCw, Maximize2, Grid3x3, Zap, Cable, Footprints } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import LightingPanel from './LightingPanel';
import TextureManager from './TextureManager';

export default function Toolbar() {
  const transformMode = useWorkspaceStore((state) => state.transformMode);
  const setTransformMode = useWorkspaceStore((state) => state.setTransformMode);
  const objects = useWorkspaceStore((state) => state.objects);
  const snapToGrid = useWorkspaceStore((state) => state.snapToGrid);
  const setSnapToGrid = useWorkspaceStore((state) => state.setSnapToGrid);
  const gridSize = useWorkspaceStore((state) => state.gridSize);
  const setGridSize = useWorkspaceStore((state) => state.setGridSize);
  const smartSurfaceDetection = useWorkspaceStore((state) => state.smartSurfaceDetection);
  const setSmartSurfaceDetection = useWorkspaceStore((state) => state.setSmartSurfaceDetection);
  const cableManagementMode = useWorkspaceStore((state) => state.cableManagementMode);
  const setCableManagementMode = useWorkspaceStore((state) => state.setCableManagementMode);
  const tidyCables = useWorkspaceStore((state) => state.tidyCables);
  const tidyWorkspace = useWorkspaceStore((state) => state.tidyWorkspace);

  const tools = [
    { mode: 'translate' as const, icon: Move, label: 'Move (G)' },
    { mode: 'rotate' as const, icon: RotateCw, label: 'Rotate (R)' },
    { mode: 'scale' as const, icon: Maximize2, label: 'Scale (S)' },
    { mode: 'walk' as const, icon: Footprints, label: 'Walk Mode' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-4 flex items-center gap-5" style={{ pointerEvents: 'auto' }}>
      {/* Transform tools */}
      <div className="flex items-center gap-2.5">
        {tools.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setTransformMode(mode)}
            title={label}
            className={`p-2 rounded-lg transition-all duration-200 ${
              transformMode === mode
                ? 'bg-cyan-500 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Snap to Grid */}
      <div className="pl-4 border-l border-gray-800 flex items-center gap-2.5">
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          title={`Snap to Grid (${snapToGrid ? 'ON' : 'OFF'})`}
          className={`p-2 rounded-lg transition-all duration-200 ${
            snapToGrid
              ? 'bg-cyan-500 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Grid3x3 className="w-5 h-5" />
        </button>
        {snapToGrid && (
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={gridSize}
            onChange={(e) => setGridSize(parseFloat(e.target.value))}
            className="w-20 accent-cyan-500"
            title={`Grid Size: ${gridSize.toFixed(1)}`}
          />
        )}
      </div>

      {/* Smart Surface Detection */}
      <div className="pl-4 border-l border-gray-800">
        <button
          onClick={() => setSmartSurfaceDetection(!smartSurfaceDetection)}
          title={`Smart Surface Detection (${smartSurfaceDetection ? 'ON' : 'OFF'})`}
          className={`p-2 rounded-lg transition-all duration-200 ${
            smartSurfaceDetection
              ? 'bg-cyan-500 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Cable Management */}
      <div className="pl-4 border-l border-gray-800 flex items-center gap-2.5">
        <button
          onClick={() => setCableManagementMode(!cableManagementMode)}
          title={`Cable Management (${cableManagementMode ? 'ON' : 'OFF'})`}
          className={`p-2 rounded-lg transition-all duration-200 ${
            cableManagementMode
              ? 'bg-cyan-500 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Cable className="w-5 h-5" />
        </button>
        {cableManagementMode && (
          <button
            onClick={tidyCables}
            title="Tidy Cables Only"
            className="px-3 py-1 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
          >
            Tidy Cables
          </button>
        )}
        <button
          onClick={tidyWorkspace}
          title="Auto-Arrange All Objects & Connect Cables"
          className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors border border-cyan-500/50 font-medium"
        >
          Auto-Arrange
        </button>
      </div>

      {/* Lighting */}
      <div className="pl-4 border-l border-gray-800">
        <LightingPanel />
      </div>

      {/* Textures */}
      <div className="pl-4 border-l border-gray-800">
        <TextureManager />
      </div>

      {/* Object count */}
      <div className="pl-4 border-l border-gray-800">
        <span className="text-sm text-gray-300 font-mono">
          {objects.length} object{objects.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

