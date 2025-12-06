import { useEffect, useRef } from 'react';
import { TransformControls as DreiTransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Object3D } from 'three';

export default function TransformControls() {
  const { scene } = useThree();
  const transformRef = useRef<any>(null);
  
  const selectedId = useWorkspaceStore((state) => state.selectedId);
  const objects = useWorkspaceStore((state) => state.objects);
  const transformMode = useWorkspaceStore((state) => state.transformMode);
  const updateObject = useWorkspaceStore((state) => state.updateObject);
  const snapToGrid = useWorkspaceStore((state) => state.snapToGrid);
  const snapValue = useWorkspaceStore((state) => state.snapValue);
  const smartSurfaceDetection = useWorkspaceStore((state) => state.smartSurfaceDetection);
  const snapToSurface = useWorkspaceStore((state) => state.snapToSurface);

  const selectedObject = objects.find((obj) => obj.id === selectedId);

  useEffect(() => {
    if (!transformRef.current || !selectedObject) return;

    const controls = transformRef.current;
    
    const handleChange = () => {
      if (controls.object) {
        let position = controls.object.position.toArray() as [number, number, number];
        let rotation = controls.object.rotation.toArray().slice(0, 3) as [number, number, number];
        const scale = controls.object.scale.toArray() as [number, number, number];
        
        // Apply snapping to position if enabled and in translate mode
        if (snapToGrid && transformMode === 'translate') {
          position = [
            snapValue(position[0]),
            snapValue(position[1]),
            snapValue(position[2]),
          ] as [number, number, number];
          controls.object.position.set(position[0], position[1], position[2]);
        }
        
        updateObject(selectedId!, { position, rotation, scale });
      }
    };

    const handleDragEnd = () => {
      if (smartSurfaceDetection && transformMode === 'translate') {
        snapToSurface(selectedId!);
      }
    };

    controls.addEventListener('objectChange', handleChange);
    controls.addEventListener('mouseUp', handleDragEnd);
    return () => {
      controls.removeEventListener('objectChange', handleChange);
      controls.removeEventListener('mouseUp', handleDragEnd);
    };
  }, [selectedId, selectedObject, updateObject, snapToGrid, snapValue, transformMode, smartSurfaceDetection, snapToSurface]);

  // Don't show transform controls in walk mode
  if (transformMode === 'walk') return null;

  if (!selectedId || !selectedObject) return null;

  // Find the actual 3D object in the scene
  let targetObject: Object3D | null = null;
  scene.traverse((child) => {
    if (child.position.x === selectedObject.position[0] &&
        child.position.y === selectedObject.position[1] &&
        child.position.z === selectedObject.position[2] &&
        child.type === 'Group') {
      targetObject = child;
    }
  });

  if (!targetObject) return null;

  return (
    <DreiTransformControls
      ref={transformRef}
      object={targetObject}
      mode={transformMode}
      size={0.7}
    />
  );
}

