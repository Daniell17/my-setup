import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

interface GLTFModelProps {
  url: string;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export default function GLTFModel({ url, castShadow, receiveShadow }: GLTFModelProps) {
  const { scene } = useGLTF(url);
  
  // Clone the scene so we can reuse the same model multiple times independently
  const clonedScene = useMemo(() => clone(scene), [scene]);

  // Enable shadows for all meshes in the model
  useMemo(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
  }, [clonedScene, castShadow, receiveShadow]);

  return <primitive object={clonedScene} />;
}

