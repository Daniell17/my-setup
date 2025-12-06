import { useWorkspaceStore } from '@/store/workspaceStore';
import WorkspaceObject3D from './WorkspaceObject3D';

export default function SceneObjects() {
  const objects = useWorkspaceStore((state) => state.objects);

  return (
    <group>
      {objects.map((obj) => (
        <WorkspaceObject3D key={obj.id} object={obj} />
      ))}
    </group>
  );
}

