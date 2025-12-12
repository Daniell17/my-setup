import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sun, Moon, Lightbulb, Palette, X } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import LightingController from './LightingController';

type LightingPreset = 'day' | 'night' | 'studio' | 'sunset' | 'custom';

interface PresetConfig {
  timeOfDay: number;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalColor: string;
  skyColor: string;
  label: string;
}

const presets: Record<LightingPreset, PresetConfig> = {
  day: {
    timeOfDay: 12,
    ambientIntensity: 0.6,
    directionalIntensity: 1.2,
    directionalColor: '#FFFFFF',
    skyColor: '#87CEEB',
    label: 'Day',
  },
  night: {
    timeOfDay: 22,
    ambientIntensity: 0.1,
    directionalIntensity: 0.1,
    directionalColor: '#1a1a2e',
    skyColor: '#000000',
    label: 'Night',
  },
  studio: {
    timeOfDay: 12,
    ambientIntensity: 0.8,
    directionalIntensity: 1.5,
    directionalColor: '#FFFFFF',
    skyColor: '#E0E0E0',
    label: 'Studio',
  },
  sunset: {
    timeOfDay: 18,
    ambientIntensity: 0.4,
    directionalIntensity: 0.7,
    directionalColor: '#FF8C00',
    skyColor: '#FF6347',
    label: 'Sunset',
  },
  custom: {
    timeOfDay: 12,
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
    directionalColor: '#FFFFFF',
    skyColor: '#87CEEB',
    label: 'Custom',
  },
};

export default function LightingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<LightingPreset>('day');
  const timeOfDay = useWorkspaceStore((state) => state.timeOfDay);
  const setTimeOfDay = useWorkspaceStore((state) => state.setTimeOfDay);

  const applyPreset = (preset: LightingPreset) => {
    const config = presets[preset];
    setTimeOfDay(config.timeOfDay);
    setActivePreset(preset);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2 text-sm"
        title="Lighting Presets"
      >
        <Lightbulb className="w-4 h-4" />
        Lighting
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="w-full max-w-md bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Lighting Presets</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {Object.entries(presets).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as LightingPreset)}
                  className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                    activePreset === key
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800">
              <label className="block text-xs text-gray-400 mb-2">Time of Day</label>
              <input
                type="range"
                min="0"
                max="24"
                step="0.1"
                value={timeOfDay}
                onChange={(e) => {
                  setTimeOfDay(parseFloat(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-cyan-500"
              />
              <div className="text-xs text-gray-500 mt-1 text-center">
                {Math.floor(timeOfDay)}:{(Math.floor((timeOfDay % 1) * 60)).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

