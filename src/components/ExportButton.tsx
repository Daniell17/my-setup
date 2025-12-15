import { useState } from 'react';
import { Download, Camera, Image as ImageIcon, Settings, X } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { captureHighQualityScreenshot, ExportFormat } from '@/utils/exportUtils';

// Check if Properties panel is visible
function usePropertiesVisible() {
  const selectedId = useWorkspaceStore((state) => state.selectedId);
  const selectedIds = useWorkspaceStore((state) => state.selectedIds);
  const objects = useWorkspaceStore((state) => state.objects);
  
  const selectedObject = objects.find((obj) => obj.id === selectedId);
  return selectedObject || selectedIds.length > 0;
}

type ExportResolution = 'hd' | 'fullhd' | '4k' | 'custom';

interface ResolutionConfig {
  width: number;
  height: number;
  label: string;
}

const resolutions: Record<ExportResolution, ResolutionConfig> = {
  hd: { width: 1280, height: 720, label: 'HD (1280x720)' },
  fullhd: { width: 1920, height: 1080, label: 'Full HD (1920x1080)' },
  '4k': { width: 3840, height: 2160, label: '4K (3840x2160)' },
  custom: { width: 1920, height: 1080, label: 'Custom' },
};

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('png');
  const [resolution, setResolution] = useState<ExportResolution>('fullhd');
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [quality, setQuality] = useState(0.95); // For JPEG/WebP
  
  const objects = useWorkspaceStore((state) => state.objects);
  const isPropertiesVisible = usePropertiesVisible();
  
  // Adjust position when Properties panel is open (it's at right-4, so we move export buttons left)
  const bottomPosition = isPropertiesVisible ? 'bottom-6 left-4' : 'bottom-6 right-4';

  const handleExportJSON = () => {
    const data = JSON.stringify(objects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workspace-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleHighQualityExport = async () => {
    setIsExporting(true);
    try {
      const res = resolution === 'custom' 
        ? { width: customWidth, height: customHeight }
        : resolutions[resolution];
      
      const dataUrl = await captureHighQualityScreenshot(format, res.width, res.height, quality);
      
      const extension = format === 'png' ? 'png' : format === 'jpeg' ? 'jpg' : 'webp';
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `workspace-export-${Date.now()}.${extension}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export screenshot. Please try again.');
    } finally {
      setIsExporting(false);
      setShowSettings(false);
    }
  };

  const handleQuickExport = async () => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        alert('3D scene canvas not found.');
        return;
      }

      const dataUrl = canvas.toDataURL(`image/${format}`, quality);
      const extension = format === 'png' ? 'png' : format === 'jpeg' ? 'jpg' : 'webp';
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `workspace-${Date.now()}.${extension}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export screenshot.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={`fixed ${bottomPosition} z-[100] flex flex-row gap-1.5 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-800 p-1.5 transition-all duration-300`} style={{ pointerEvents: 'auto' }}>
        <button
          onClick={handleHighQualityExport}
          disabled={isExporting}
          title="Export High Quality Screenshot"
          className="p-2 text-cyan-400 hover:bg-gray-800 hover:text-cyan-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={handleQuickExport}
          disabled={isExporting}
          title="Quick Export (Current Resolution)"
          className="p-2 text-cyan-400 hover:bg-gray-800 hover:text-cyan-300 transition-all duration-200 disabled:opacity-50 rounded-md"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          title="Export Settings"
          className={`p-2 text-cyan-400 hover:bg-gray-800 hover:text-cyan-300 transition-all duration-200 rounded-md ${
            showSettings ? 'bg-gray-800' : ''
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportJSON}
          title="Export JSON"
          className="p-2 text-cyan-400 hover:bg-gray-800 hover:text-cyan-300 transition-all duration-200 rounded-md"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className={`fixed ${isPropertiesVisible ? 'bottom-16 left-4' : 'bottom-16 right-4'} z-[101] bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-4 w-80 transition-all duration-300`} style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Export Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Format</label>
              <div className="flex gap-2">
                {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      format === fmt
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as ExportResolution)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {Object.entries(resolutions).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Resolution */}
            {resolution === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Width</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1920)}
                    min={100}
                    max={7680}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Height</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 1080)}
                    min={100}
                    max={4320}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Quality (for JPEG/WebP) */}
            {(format === 'jpeg' || format === 'webp') && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
