import { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { useWorkspaceStore } from '@/store/workspaceStore';
import * as THREE from 'three';

export default function MeasurementTool() {
  const measurementMode = useWorkspaceStore((state) => state.measurementMode);
  const objects = useWorkspaceStore((state) => state.objects);
  const [startPoint, setStartPoint] = useState<THREE.Vector3 | null>(null);
  const [endPoint, setEndPoint] = useState<THREE.Vector3 | null>(null);
  const { raycaster, camera, scene, gl } = useThree();

  useEffect(() => {
    const handleClick = (event: PointerEvent) => {
      if (!measurementMode) return;
      
      // Calculate pointer position for raycaster
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // Filter out the measurement tool helpers themselves if needed, 
      // or just take the first visual object.
      const validIntersects = intersects.filter(i => i.object.type !== 'Line');

      if (validIntersects.length > 0) {
        const point = validIntersects[0].point;
        
        if (!startPoint) {
          setStartPoint(point);
          setEndPoint(point); 
        } else {
          if (!endPoint || startPoint.distanceTo(endPoint) < 0.01) {
             setEndPoint(point);
          } else {
             // Reset if we already have a full line and click again
             setStartPoint(point);
             setEndPoint(point);
          }
        }
      }
    };

    if (measurementMode) {
      gl.domElement.addEventListener('pointerdown', handleClick);
    }

    return () => {
      gl.domElement.removeEventListener('pointerdown', handleClick);
    };
  }, [measurementMode, gl.domElement, camera, raycaster, scene, startPoint, endPoint]);


  if (!measurementMode) return null;

  return (
    <group>
      {/* Dimensions Overlay */}
      {objects.map((obj) => {
        const width = obj.dimensions?.width ?? obj.scale[0];
        const height = obj.dimensions?.height ?? obj.scale[1];
        const depth = obj.dimensions?.depth ?? obj.scale[2];
        
        return (
          <group key={obj.id} position={obj.position} rotation={obj.rotation}>
             <Html position={[0, height/2 + 0.2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
               <div className="bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded border border-white/20 font-mono whitespace-nowrap pointer-events-none select-none">
                 {width.toFixed(2)}m x {height.toFixed(2)}m x {depth.toFixed(2)}m
               </div>
             </Html>
             <mesh>
               <boxGeometry args={[width, height, depth]} />
               <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.1} depthTest={false} />
             </mesh>
          </group>
        );
      })}

      {/* Ruler Line */}
      {startPoint && endPoint && (
        <group>
          <Line 
            points={[startPoint, endPoint]} 
            color="#facc15" 
            lineWidth={2} 
          />
          <mesh position={startPoint}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          <mesh position={endPoint}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>
          <Html position={endPoint.clone().lerp(startPoint, 0.5)} center zIndexRange={[100, 0]}>
             <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold font-mono whitespace-nowrap pointer-events-none select-none">
               {startPoint.distanceTo(endPoint).toFixed(2)}m
             </div>
          </Html>
        </group>
      )}
    </group>
  );
}
