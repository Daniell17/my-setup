import { useMemo } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { CatmullRomCurve3, Vector3 } from 'three';
import { getAnchorPoint } from '@/utils/cableRouting';

export default function CableRenderer() {
  const cables = useWorkspaceStore((state) => state.cables);
  const cableManagementMode = useWorkspaceStore((state) => state.cableManagementMode);
  const objects = useWorkspaceStore((state) => state.objects);

  if (!cableManagementMode || cables.length === 0) return null;

  return (
    <>
      {cables.map((cable) => {
        const fromObj = objects.find((o) => o.id === cable.from);
        const toObj = objects.find((o) => o.id === cable.to);
        if (!fromObj || !toObj) return null;

        return (
          <CablePath 
            key={cable.id} 
            cable={cable} 
            fromObj={fromObj} 
            toObj={toObj}
            objects={objects}
          />
        );
      })}
    </>
  );
}

function CablePath({ 
  cable, 
  fromObj, 
  toObj,
  objects 
}: { 
  cable: { id: string; from: string; to: string; path: [number, number, number][] };
  fromObj: any;
  toObj: any;
  objects: any[];
}) {
  const fromAnchor = getAnchorPoint(fromObj);
  const toAnchor = getAnchorPoint(toObj);

  // Calculate physics-based cable path with gravity sag
  const physicsPath = useMemo(() => {
    // Use existing path if available, otherwise calculate a simple path
    let basePath: Vector3[];
    
    if (cable.path && cable.path.length > 0) {
      basePath = cable.path.map(p => new Vector3(...p));
    } else {
      // Simple straight path if no path defined
      basePath = [fromAnchor.clone(), toAnchor.clone()];
    }

    // Apply gravity simulation to cable segments
    const saggedPath: Vector3[] = [];
    const gravity = 9.8;
    const cableStiffness = 0.3; // How much the cable resists sagging (0-1)

    for (let i = 0; i < basePath.length; i++) {
      saggedPath.push(basePath[i].clone());

      // Add sagging to segments between points (except first and last)
      if (i < basePath.length - 1) {
        const start = basePath[i];
        const end = basePath[i + 1];
        const horizontalDistance = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
        );

        // Calculate sag based on horizontal distance and vertical drop
        if (horizontalDistance > 0.1 && end.y < start.y) {
          const verticalDrop = start.y - end.y;
          const midPoint = new Vector3(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2,
            (start.z + end.z) / 2
          );

          // Calculate sag amount (more sag for longer horizontal distances)
          const sagAmount = Math.min(
            (horizontalDistance * horizontalDistance * gravity * (1 - cableStiffness)) / 8,
            verticalDrop * 0.5 // Don't sag more than half the vertical drop
          );

          midPoint.y -= sagAmount;
          saggedPath.push(midPoint);
        } else if (horizontalDistance > 0.1) {
          // Horizontal or upward segment - apply sag
          const midPoint = new Vector3(
            (start.x + end.x) / 2,
            Math.min(start.y, end.y) - (horizontalDistance * horizontalDistance * gravity * (1 - cableStiffness)) / 8,
            (start.z + end.z) / 2
          );
          saggedPath.push(midPoint);
        }
      }
    }

    // Collision detection - check if cable intersects with objects
    const finalPath: Vector3[] = [];
    for (let i = 0; i < saggedPath.length - 1; i++) {
      finalPath.push(saggedPath[i].clone());

      const segmentStart = saggedPath[i];
      const segmentEnd = saggedPath[i + 1];

      // Check for collisions with objects
      for (const obj of objects) {
        if (obj.id === cable.from || obj.id === cable.to) continue;

        const objPos = new Vector3(...obj.position);
        const objScale = obj.scale || [1, 1, 1];
        const dimensions = obj.dimensions || {};
        const width = (dimensions.width || objScale[0]) / 2;
        const height = (dimensions.height || objScale[1]) / 2;
        const depth = (dimensions.depth || objScale[2]) / 2;

        // Simple AABB collision check
        const minX = objPos.x - width;
        const maxX = objPos.x + width;
        const minY = objPos.y - height;
        const minZ = objPos.z - depth;
        const maxZ = objPos.z + depth;

        // Check if segment intersects the object bounding box
        const t = (minY - segmentStart.y) / (segmentEnd.y - segmentStart.y);
        if (t > 0 && t < 1) {
          const intersectX = segmentStart.x + t * (segmentEnd.x - segmentStart.x);
          const intersectZ = segmentStart.z + t * (segmentEnd.z - segmentStart.z);

          if (
            intersectX >= minX && intersectX <= maxX &&
            intersectZ >= minZ && intersectZ <= maxZ
          ) {
            // Cable wraps around object - adjust path
            const wrapPoint = new Vector3(
              intersectX > objPos.x ? maxX + 0.05 : minX - 0.05,
              minY - 0.05,
              intersectZ > objPos.z ? maxZ + 0.05 : minZ - 0.05
            );
            finalPath.push(wrapPoint);
          }
        }
      }
    }

    finalPath.push(saggedPath[saggedPath.length - 1].clone());
    return finalPath;
  }, [cable.path, fromAnchor, toAnchor, objects]);

  const curve = useMemo(() => {
    if (physicsPath.length < 2) {
      // Fallback to straight line
      return new CatmullRomCurve3([fromAnchor, toAnchor]);
    }
    return new CatmullRomCurve3(physicsPath);
  }, [physicsPath, fromAnchor, toAnchor]);

  return (
    <mesh castShadow receiveShadow>
      <tubeGeometry args={[curve, 32, 0.015, 8, false]} />
      <meshStandardMaterial 
        color="#2a2a2a" 
        emissive="#1a1a1a" 
        emissiveIntensity={0.3}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}
