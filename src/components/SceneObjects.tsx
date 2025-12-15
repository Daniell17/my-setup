import { useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useWorkspaceStore } from '@/store/workspaceStore';
import WorkspaceObject3D from './WorkspaceObject3D';
import * as THREE from 'three';

// LOD distances (in world units)
const LOD_DISTANCES = {
  high: 10,   // High detail within 10 units
  medium: 25, // Medium detail within 25 units
  low: 50,    // Low detail beyond 25 units
};

export default function SceneObjects() {
  const objects = useWorkspaceStore((state) => state.objects);
  const { camera } = useThree();
  const frustum = useMemo(() => new THREE.Frustum(), []);
  const matrix = useMemo(() => new THREE.Matrix4(), []);

  // Frustum culling: only render objects in view
  const visibleObjects = useMemo(() => {
    if (objects.length === 0) return [];

    // Update frustum from camera
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(matrix);

    return objects.filter(obj => {
      const position = new THREE.Vector3(...obj.position);
      const size = Math.max(
        obj.scale[0] || obj.dimensions?.width || 1,
        obj.scale[1] || obj.dimensions?.height || 1,
        obj.scale[2] || obj.dimensions?.depth || 1
      );
      
      // Create bounding sphere
      const sphere = new THREE.Sphere(position, size);
      
      // Check if sphere intersects frustum
      return frustum.intersectsSphere(sphere);
    });
  }, [objects, camera, frustum, matrix]);

  // Update frustum every frame
  useFrame(() => {
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(matrix);
  });

  return (
    <group>
      {visibleObjects.map((obj) => {
        // Calculate distance from camera for LOD
        const distance = camera.position.distanceTo(
          new THREE.Vector3(...obj.position)
        );

        let lodLevel: 'high' | 'medium' | 'low' = 'high';
        if (distance > LOD_DISTANCES.medium) {
          lodLevel = 'low';
        } else if (distance > LOD_DISTANCES.high) {
          lodLevel = 'medium';
        }

        return (
          <WorkspaceObject3D 
            key={obj.id} 
            object={obj}
            lodLevel={lodLevel}
          />
        );
      })}
    </group>
  );
}
