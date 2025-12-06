import { useWorkspaceStore } from "@/store/workspaceStore";
import { DoubleSide } from "three";

export default function RoomEnvironment() {
  const room = useWorkspaceStore((state) => state.room);

  if (!room) return null; // Safety check

  const { width, depth, height, wallVisible, floorColor } = room;

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Walls */}
      {wallVisible && (
        <group>
          {/* Back Wall */}
          <mesh
            position={[0, height / 2, -depth / 2]}
            receiveShadow
          >
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial color="#e5e5e5" side={DoubleSide} />
          </mesh>

          {/* Left Wall */}
          <mesh
            position={[-width / 2, height / 2, 0]}
            rotation={[0, Math.PI / 2, 0]}
            receiveShadow
          >
            <planeGeometry args={[depth, height]} />
            <meshStandardMaterial color="#e5e5e5" side={DoubleSide} />
          </mesh>

          {/* Right Wall */}
          <mesh
            position={[width / 2, height / 2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            receiveShadow
          >
            <planeGeometry args={[depth, height]} />
            <meshStandardMaterial color="#e5e5e5" side={DoubleSide} />
          </mesh>

           {/* Window on Back Wall (Simple visual representation) */}
           {/* We simulate a window by adding a frame and a glass pane */}
           <group position={[width / 4, height * 0.6, -depth / 2 + 0.01]}>
              <mesh>
                <boxGeometry args={[1.2, 1.5, 0.05]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[1, 1.3]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.3} />
              </mesh>
           </group>
        </group>
      )}
    </group>
  );
}

