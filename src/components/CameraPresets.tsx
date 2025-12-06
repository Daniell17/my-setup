import { useRef, useEffect } from 'react';
import { Camera, Maximize2, Eye, Box } from 'lucide-react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useWorkspaceStore } from '@/store/workspaceStore';

type CameraPreset = 'top' | 'front' | 'side' | 'isometric' | 'back';

interface PresetConfig {
  position: [number, number, number];
  target: [number, number, number];
  label: string;
}

const presets: Record<CameraPreset, PresetConfig> = {
  top: {
    position: [0, 10, 0],
    target: [0, 0, 0],
    label: 'Top',
  },
  front: {
    position: [0, 3, 8],
    target: [0, 0, 0],
    label: 'Front',
  },
  side: {
    position: [8, 3, 0],
    target: [0, 0, 0],
    label: 'Side',
  },
  isometric: {
    position: [5, 5, 5],
    target: [0, 0, 0],
    label: 'Iso',
  },
  back: {
    position: [0, 3, -8],
    target: [0, 0, 0],
    label: 'Back',
  },
};

export const cameraPresetsRef = {
  setPreset: null as ((preset: CameraPreset) => void) | null,
};

export function CameraPresetsControls() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const transformMode = useWorkspaceStore((state) => state.transformMode);

  useEffect(() => {
    cameraPresetsRef.setPreset = (preset: CameraPreset) => {
      const config = presets[preset];
      
      const startPos = new THREE.Vector3().copy(camera.position);
      const endPos = new THREE.Vector3(...config.position);
      const startTarget = controlsRef.current?.target || new THREE.Vector3(0, 0, 0);
      const endTarget = new THREE.Vector3(...config.target);
      
      let progress = 0;
      const duration = 500;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        camera.position.lerpVectors(startPos, endPos, eased);
        
        if (controlsRef.current) {
          controlsRef.current.target.lerpVectors(startTarget, endTarget, eased);
          controlsRef.current.update();
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    };
  }, [camera]);

  // Disable OrbitControls in walk mode
  if (transformMode === 'walk') return null;

  return <OrbitControls ref={controlsRef} makeDefault minDistance={2} maxDistance={20} maxPolarAngle={Math.PI / 2 - 0.1} enableDamping dampingFactor={0.05} />;
}

export default function CameraPresetsUI() {
  const setCameraPreset = (preset: CameraPreset) => {
    if (cameraPresetsRef.setPreset) {
      cameraPresetsRef.setPreset(preset);
    }
  };

  const iconMap = {
    top: <Maximize2 className="w-4 h-4" />,
    front: <Eye className="w-4 h-4" />,
    side: <Box className="w-4 h-4" />,
    isometric: <Camera className="w-4 h-4" />,
    back: <Eye className="w-4 h-4" />,
  };

  return (
    <div className="fixed top-20 right-4 z-[100] bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-2 flex flex-col gap-1" style={{ pointerEvents: 'auto' }}>
      <div className="px-2 py-1 text-xs text-gray-400 font-medium mb-1">Camera</div>
      {Object.entries(presets).map(([key, config]) => (
        <button
          key={key}
          onClick={() => setCameraPreset(key as CameraPreset)}
          title={config.label}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-cyan-400 transition-all duration-200 flex items-center justify-center"
        >
          {iconMap[key as CameraPreset]}
        </button>
      ))}
    </div>
  );
}

