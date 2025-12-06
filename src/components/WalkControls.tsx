import { PointerLockControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import * as THREE from 'three';

export default function WalkControls() {
  const camera = useThree((state) => state.camera);
  const transformMode = useWorkspaceStore((state) => state.transformMode);
  const moveState = useRef({ forward: false, backward: false, left: false, right: false });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  // Adjust camera height for walking
  useEffect(() => {
    if (transformMode === 'walk') {
      camera.position.y = 1.7; // Average eye height
      camera.lookAt(camera.position.x, 1.7, camera.position.z - 1);
    }
  }, [transformMode, camera]);

  // Keyboard controls
  useEffect(() => {
    if (transformMode !== 'walk') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          moveState.current.forward = true;
          break;
        case 's':
          moveState.current.backward = true;
          break;
        case 'a':
          moveState.current.left = true;
          break;
        case 'd':
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          moveState.current.forward = false;
          break;
        case 's':
          moveState.current.backward = false;
          break;
        case 'a':
          moveState.current.left = false;
          break;
        case 'd':
          moveState.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [transformMode]);

  // Movement logic
  useFrame((_state, delta) => {
    if (transformMode !== 'walk') return;

    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward);
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left);
    direction.current.normalize();

    const speed = 5.0;
    if (moveState.current.forward || moveState.current.backward) velocity.current.z -= direction.current.z * speed * delta;
    if (moveState.current.left || moveState.current.right) velocity.current.x -= direction.current.x * speed * delta;

    const moveVector = new THREE.Vector3();
    camera.getWorldDirection(moveVector);
    moveVector.y = 0;
    moveVector.normalize();

    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(moveVector, new THREE.Vector3(0, 1, 0));

    const finalMove = new THREE.Vector3();
    finalMove.addScaledVector(moveVector, -velocity.current.z);
    finalMove.addScaledVector(rightVector, velocity.current.x);

    camera.position.addScaledVector(finalMove, delta);

    // Keep camera at eye height
    camera.position.y = 1.7;
  });

  if (transformMode !== 'walk') return null;

  return <PointerLockControls />;
}
