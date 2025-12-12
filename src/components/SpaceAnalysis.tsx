import { useMemo } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';

export default function SpaceAnalysis() {
  const objects = useWorkspaceStore((state) => state.objects);
  const room = useWorkspaceStore((state) => state.room);
  const selectedId = useWorkspaceStore((state) => state.selectedId);
  const selectedIds = useWorkspaceStore((state) => state.selectedIds);
  
  // Check if Properties panel is visible
  const selectedObject = objects.find((obj) => obj.id === selectedId);
  const isPropertiesVisible = selectedObject || selectedIds.length > 0;

  const analysis = useMemo(() => {
    const roomVolume = room.width * room.depth * room.height;
    let totalObjectVolume = 0;
    let floorAreaUsed = 0;
    const objectDensity: Record<string, number> = {};

    objects.forEach(obj => {
      const width = obj.scale[0] || obj.dimensions?.width || 1;
      const height = obj.scale[1] || obj.dimensions?.height || 1;
      const depth = obj.scale[2] || obj.dimensions?.depth || 1;
      
      const volume = width * height * depth;
      totalObjectVolume += volume;
      floorAreaUsed += width * depth;
      
      const category = obj.type;
      objectDensity[category] = (objectDensity[category] || 0) + 1;
    });

    const floorArea = room.width * room.depth;
    const spaceUtilization = (floorAreaUsed / floorArea) * 100;
    const volumeUtilization = (totalObjectVolume / roomVolume) * 100;

    // Ergonomic recommendations
    const recommendations: string[] = [];
    
    if (spaceUtilization > 80) {
      recommendations.push('Workspace is very crowded. Consider removing some items.');
    } else if (spaceUtilization < 20) {
      recommendations.push('Workspace is underutilized. You have room for more items.');
    }

    const desk = objects.find(o => o.type === 'desk');
    const monitors = objects.filter(o => o.type === 'monitor');
    const chair = objects.find(o => o.type === 'chair');

    if (desk && monitors.length === 0) {
      recommendations.push('Consider adding a monitor for better productivity.');
    }

    if (desk && !chair) {
      recommendations.push('Add a chair for ergonomic comfort.');
    }

    if (monitors.length > 2) {
      recommendations.push('Multiple monitors detected. Ensure proper viewing angles.');
    }

    // Efficiency score (0-100)
    let efficiencyScore = 100;
    if (spaceUtilization > 90) efficiencyScore -= 20;
    if (spaceUtilization < 10) efficiencyScore -= 15;
    if (!desk) efficiencyScore -= 30;
    if (!chair) efficiencyScore -= 20;
    if (monitors.length === 0) efficiencyScore -= 15;
    efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));

    return {
      spaceUtilization: Math.min(100, spaceUtilization),
      volumeUtilization: Math.min(100, volumeUtilization),
      floorAreaUsed,
      floorArea,
      totalObjectVolume,
      roomVolume,
      objectCount: objects.length,
      objectDensity,
      recommendations,
      efficiencyScore,
    };
  }, [objects, room]);

  // Hide Space Analysis when Properties panel is open to avoid overlap
  if (isPropertiesVisible) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-20 w-80 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-4" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center gap-2 mb-4 text-white">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h2 className="font-semibold">Space Analysis</h2>
      </div>

      {/* Efficiency Score */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Efficiency Score</span>
          <span className={`text-2xl font-bold font-mono ${
            analysis.efficiencyScore >= 80 ? 'text-green-400' :
            analysis.efficiencyScore >= 60 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {analysis.efficiencyScore}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              analysis.efficiencyScore >= 80 ? 'bg-green-500' :
              analysis.efficiencyScore >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${analysis.efficiencyScore}%` }}
          />
        </div>
      </div>

      {/* Space Utilization */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Floor Space Used</span>
            <span className="text-white font-mono">
              {analysis.spaceUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${analysis.spaceUtilization}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analysis.floorAreaUsed.toFixed(2)}m² / {analysis.floorArea.toFixed(2)}m²
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Volume Used</span>
            <span className="text-white font-mono">
              {analysis.volumeUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${analysis.volumeUtilization}%` }}
            />
          </div>
        </div>
      </div>

      {/* Object Density */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Object Distribution</label>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {Object.entries(analysis.objectDensity)
            .sort(([, a], [, b]) => b - a)
            .map(([category, count]) => (
              <div key={category} className="flex justify-between text-xs">
                <span className="text-gray-300 capitalize">{category}</span>
                <span className="text-gray-400 font-mono">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Recommendations
          </label>
          <div className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 text-xs bg-gray-800 rounded-lg p-2">
                <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded-lg p-2">
          <CheckCircle className="w-4 h-4" />
          <span>Workspace looks great!</span>
        </div>
      )}
    </div>
  );
}

