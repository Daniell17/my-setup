import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, PerspectiveCamera, Environment } from '@react-three/drei';
import SceneObjects from './SceneObjects';
import TransformControls from './TransformControls';
import { CameraPresetsControls } from './CameraPresets';
import CableRenderer from './CableRenderer';
import LightingController from './LightingController';
import RoomEnvironment from './RoomEnvironment';
import MeasurementTool from './MeasurementTool';
import WalkControls from './WalkControls';
import { useWorkspaceStore } from '@/store/workspaceStore';

function SceneContent() {
  const selectObject = useWorkspaceStore((state) => state.selectObject);

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
      
      <Suspense fallback={null}>
        <Environment 
          preset="city" 
          environmentIntensity={1.0}
          environmentBlur={0.5}
        />
      </Suspense>

      {/* Lighting */}
      <LightingController />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#22d3ee" />

      {/* Grid floor - clickable to deselect */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            selectObject(null);
          }
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Grid visual */}
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#334155"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Scene Objects */}
      <SceneObjects />
      <TransformControls />
      <CableRenderer />
      <RoomEnvironment />
      <MeasurementTool />
      <WalkControls />

      {/* Camera Controls */}
      <CameraPresetsControls />
    </>
  );
}

export default function Scene() {
  return (
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0, pointerEvents: 'auto', width: '100%', height: '100%' }}>
      <Canvas 
        shadows 
        className="w-full h-full" 
        style={{ display: 'block', width: '100%', height: '100%' }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance',
          logarithmicDepthBuffer: true,
          toneMappingExposure: 1.2,
          outputColorSpace: 'srgb',
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

