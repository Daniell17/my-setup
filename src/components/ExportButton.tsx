import { useState } from 'react';
import { Download, Camera, Image as ImageIcon } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import html2canvas from 'html2canvas';

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const objects = useWorkspaceStore((state) => state.objects);

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

  const handleExportCanvasPNG = () => {
    const sceneElement = document.querySelector('canvas');
    if (sceneElement instanceof HTMLCanvasElement) {
      const dataUrl = sceneElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'workspace-screenshot.png';
      a.click();
    } else {
      alert('3D scene canvas not found.');
    }
  };

  const handleExportFullScene = async () => {
    setIsExporting(true);
    try {
      const canvasElement = document.querySelector('canvas');
      if (!canvasElement) {
        alert('3D scene canvas not found.');
        return;
      }

      const canvas = await html2canvas(document.body, {
        backgroundColor: '#000000',
        useCORS: true,
        logging: false,
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 2,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `workspace-full-${Date.now()}.png`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export screenshot. Trying canvas-only export...');
      handleExportCanvasPNG();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
      <button
        onClick={handleExportFullScene}
        disabled={isExporting}
        title="Export Full Scene (PNG)"
        className="p-3 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 text-cyan-400 hover:bg-gray-800 hover:border-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ImageIcon className="w-5 h-5" />
        )}
      </button>
      <button
        onClick={handleExportCanvasPNG}
        title="Export Canvas Only (PNG)"
        className="p-3 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 text-cyan-400 hover:bg-gray-800 hover:border-cyan-500 transition-all duration-200"
      >
        <Camera className="w-5 h-5" />
      </button>
      <button
        onClick={handleExportJSON}
        title="Export JSON"
        className="p-3 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 text-cyan-400 hover:bg-gray-800 hover:border-cyan-500 transition-all duration-200"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
}
