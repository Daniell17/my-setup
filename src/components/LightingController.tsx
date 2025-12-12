import { useMemo } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';

export default function LightingController() {
  const timeOfDay = useWorkspaceStore((state) => state.timeOfDay);

  const lighting = useMemo(() => {
    let ambientIntensity = 0.4;
    let directionalIntensity = 1;
    let directionalColor = '#ffffff';
    let skyColor = '#87CEEB';
    let sunPosition: [number, number, number] = [10, 10, 5];

    if (timeOfDay >= 6 && timeOfDay < 8) {
      ambientIntensity = 0.3;
      directionalIntensity = 0.5;
      directionalColor = '#FFB347';
      skyColor = '#FFA07A';
    } else if (timeOfDay >= 8 && timeOfDay < 10) {
      ambientIntensity = 0.5;
      directionalIntensity = 0.8;
      directionalColor = '#FFD700';
      skyColor = '#FFE4B5';
    } else if (timeOfDay >= 10 && timeOfDay < 16) {
      ambientIntensity = 0.6;
      directionalIntensity = 1.2;
      directionalColor = '#FFFFFF';
      skyColor = '#87CEEB';
    } else if (timeOfDay >= 16 && timeOfDay < 18) {
      ambientIntensity = 0.4;
      directionalIntensity = 0.7;
      directionalColor = '#FF8C00';
      skyColor = '#FF6347';
    } else if (timeOfDay >= 18 && timeOfDay < 20) {
      ambientIntensity = 0.2;
      directionalIntensity = 0.3;
      directionalColor = '#FF4500';
      skyColor = '#2F4F4F';
    } else {
      ambientIntensity = 0.1;
      directionalIntensity = 0.1;
      directionalColor = '#1a1a2e';
      skyColor = '#000000';
      sunPosition = [-10, 5, -10];
    }

    const sunAngle = ((timeOfDay - 6) / 12) * Math.PI;
    sunPosition = [
      Math.cos(sunAngle) * 10,
      Math.max(2, Math.sin(sunAngle) * 10),
      Math.sin(sunAngle) * 5,
    ];

    return {
      ambientIntensity,
      directionalIntensity,
      directionalColor,
      skyColor,
      sunPosition,
    };
  }, [timeOfDay]);

  return (
    <>
      <ambientLight intensity={lighting.ambientIntensity} color={lighting.skyColor} />
      <directionalLight
        position={lighting.sunPosition}
        intensity={lighting.directionalIntensity}
        color={lighting.directionalColor}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      {/* Fill light for softer shadows */}
      <directionalLight
        position={[-lighting.sunPosition[0], lighting.sunPosition[1] * 0.5, -lighting.sunPosition[2]]}
        intensity={lighting.directionalIntensity * 0.3}
        color={lighting.skyColor}
      />
      {/* Rim light for depth */}
      <directionalLight
        position={[0, 5, -10]}
        intensity={0.2}
        color="#ffffff"
      />
      <color attach="background" args={[lighting.skyColor]} />
    </>
  );
}

export function LightingUI() {
  const timeOfDay = useWorkspaceStore((state) => state.timeOfDay);
  const setTimeOfDay = useWorkspaceStore((state) => state.setTimeOfDay);

  const timeLabel = useMemo(() => {
    const hours = Math.floor(timeOfDay);
    const minutes = Math.floor((timeOfDay - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }, [timeOfDay]);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-4 flex items-center gap-4" style={{ pointerEvents: 'auto' }}>
      <div className="text-xs text-gray-400 font-medium">Time of Day</div>
      <input
        type="range"
        min="0"
        max="24"
        step="0.1"
        value={timeOfDay}
        onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
        className="w-64 accent-cyan-500"
      />
      <div className="text-sm text-white font-mono min-w-[80px] text-right">{timeLabel}</div>
    </div>
  );
}

