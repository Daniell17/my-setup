import { useRef } from 'react';
import { Group } from 'three';
import { useWorkspaceStore, WorkspaceObject, ObjectType } from '@/store/workspaceStore';

export const contextMenuState = {
  show: false,
  objectId: null as string | null,
  position: null as { x: number; y: number } | null,
  setShow: (show: boolean, objectId: string | null = null, position: { x: number; y: number } | null = null) => {
    contextMenuState.show = show;
    contextMenuState.objectId = objectId;
    contextMenuState.position = position;
    if (contextMenuState.onChange) {
      contextMenuState.onChange();
    }
  },
  onChange: null as (() => void) | null,
};

interface Props {
  object: WorkspaceObject;
}

const ObjectGeometry = ({ 
  type, 
  color, 
  dimensions, 
  material, 
  properties 
}: { 
  type: ObjectType; 
  color: string; 
  dimensions?: WorkspaceObject['dimensions'];
  material?: WorkspaceObject['material'];
  properties?: WorkspaceObject['properties'];
}) => {
  const w = dimensions?.width ?? 1;
  const h = dimensions?.height ?? 1;
  const d = dimensions?.depth ?? 1;

  // Material properties
  const roughness = properties?.roughness ?? 0.5;
  const metalness = properties?.metalness ?? 0.5;
  const opacity = properties?.opacity ?? 1;
  const transparent = properties?.transparent ?? false;
  const materialType = material?.type ?? 'standard';

  const commonMaterialProps = {
    color,
    roughness,
    metalness,
    transparent,
    opacity,
  };

  // Override based on material type if needed
  if (materialType === 'glass') {
    commonMaterialProps.transparent = true;
    commonMaterialProps.opacity = Math.min(opacity, 0.5);
    commonMaterialProps.roughness = 0.1;
    commonMaterialProps.metalness = 0.9;
  } else if (materialType === 'metal') {
    commonMaterialProps.metalness = 0.8;
    commonMaterialProps.roughness = 0.2;
  } else if (materialType === 'wood') {
    commonMaterialProps.roughness = 0.8;
    commonMaterialProps.metalness = 0;
  }

  switch (type) {
    case 'desk':
      const deskW = dimensions?.width ?? 2;
      const deskH = dimensions?.height ?? 0.05;
      const deskD = dimensions?.depth ?? 1;
      // Desk leg height: 0.73m (73cm) - realistic desk height
      const LEG_HEIGHT = 0.73;
      const LEG_THICKNESS = 0.06;
      // Desk origin is at floor level, legs extend upward
      // Surface sits on top of legs
      const SURFACE_Y = LEG_HEIGHT + deskH / 2;
      
      return (
        <group>
          {/* Desktop surface */}
          <mesh position={[0, SURFACE_Y, 0]} castShadow receiveShadow>
            <boxGeometry args={[deskW, deskH, deskD]} />
            <meshStandardMaterial {...commonMaterialProps} roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Legs - positioned so they extend from floor (Y=0) upward */}
          {[[-deskW*0.45, LEG_HEIGHT/2, -deskD*0.4], [-deskW*0.45, LEG_HEIGHT/2, deskD*0.4], [deskW*0.45, LEG_HEIGHT/2, -deskD*0.4], [deskW*0.45, LEG_HEIGHT/2, deskD*0.4]].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} castShadow>
              <boxGeometry args={[LEG_THICKNESS, LEG_HEIGHT, LEG_THICKNESS]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.3} />
            </mesh>
          ))}
        </group>
      );

    case 'monitor':
      const monW = dimensions?.width ?? 0.8;
      const monH = dimensions?.height ?? 0.5;
      const monD = dimensions?.depth ?? 0.03;
      return (
        <group>
          {/* Screen */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[monW, monH, monD]} />
            <meshStandardMaterial {...commonMaterialProps} color="#1a1a2e" />
          </mesh>
          {/* Screen glow / Image */}
          <mesh position={[0, 0.25, 0.02]}>
            <planeGeometry args={[monW * 0.875, monH * 0.8]} />
            {material?.textureUrl ? (
              <meshBasicMaterial>
                 {/* Placeholder for texture loading logic if we had it, 
                     but since we can't easily load textures without useLoader/useTexture inside the component 
                     and dealing with async, we might need to skip actual texture rendering 
                     OR assume useTexture is available. 
                     For now, let's stick to color/emissive unless we implement useTexture properly. 
                 */}
                 {/* actually, let's try to just use color for now, implementing full texture loading 
                     requires handling the async nature of textures in R3F nicely. */}
              </meshBasicMaterial>
            ) : (
              <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.3} />
            )}
             <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.3} />
          </mesh>
          {/* Stand */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.15, 0.1]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Base */}
          <mesh position={[0, -0.07, 0.05]} castShadow>
            <boxGeometry args={[0.25, 0.02, 0.2]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );

    case 'pc-tower':
      const pcW = dimensions?.width ?? 0.2;
      const pcH = dimensions?.height ?? 0.45;
      const pcD = dimensions?.depth ?? 0.4;
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[pcW, pcH, pcD]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
          </mesh>
          {/* LED strip */}
          <mesh position={[pcW/2 + 0.001, 0, 0]}>
            <boxGeometry args={[0.01, pcH * 0.78, 0.02]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
          </mesh>
          {/* Vents */}
          {[-0.15, -0.05, 0.05, 0.15].map((y, i) => (
            <mesh key={i} position={[pcW/2 + 0.001, y, 0.1]} castShadow>
              <boxGeometry args={[0.01, 0.02, 0.15]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </group>
      );

    case 'lamp':
      return (
        <group>
          {/* Base */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.02, 16]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Arm */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
            <meshStandardMaterial color="#555" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Shade */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <coneGeometry args={[0.1, 0.12, 16, 1, true]} />
            <meshStandardMaterial color={color} side={2} />
          </mesh>
          {/* Light */}
          <pointLight position={[0, 0.35, 0]} intensity={0.5} color="#fff5e6" distance={2} />
        </group>
      );

    case 'speaker':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial {...commonMaterialProps} />
          </mesh>
          {/* Woofer */}
          <mesh position={[w/2 + 0.001, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[Math.min(w, h) * 0.25, Math.min(w, h) * 0.25, 0.02, 16]} />
            <meshStandardMaterial color="#222" metalness={0.3} />
          </mesh>
          {/* Tweeter */}
          <mesh position={[w/2 + 0.001, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[Math.min(w, h) * 0.1, Math.min(w, h) * 0.1, 0.02, 16]} />
            <meshStandardMaterial color="#444" metalness={0.5} />
          </mesh>
        </group>
      );

    case 'plant':
      return (
        <group>
          {/* Pot */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
            <meshStandardMaterial color="#3d2817" roughness={1} />
          </mesh>
          {/* Leaves */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.05,
                0.15 + (i % 3) * 0.03,
                Math.sin((angle * Math.PI) / 180) * 0.05,
              ]}
              rotation={[0.3, (angle * Math.PI) / 180, 0.2]}
              castShadow
            >
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          ))}
        </group>
      );

    case 'keyboard':
      return (
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>
      );

    case 'mouse':
      const mouseR = dimensions?.radius ?? 0.03;
      const mouseH = dimensions?.height ?? 0.06;
      return (
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[mouseR, mouseH, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} />
        </mesh>
      );

    case 'chair':
      return (
        <group>
          {/* Seat */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.5, 0.08, 0.5]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.8, -0.22]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.08]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Base */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />
            <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Wheels base */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.2,
                0.05,
                Math.sin((angle * Math.PI) / 180) * 0.2,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          ))}
        </group>
      );

    case 'shelf':
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial {...commonMaterialProps} />
        </mesh>
      );

    case 'mug':
      return (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* Handle */}
          <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.025, 0.008, 8, 16, Math.PI]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* Coffee */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
        </group>
      );

    case 'headphones':
      return (
        <group>
          {/* Headband */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <torusGeometry args={[0.1, 0.015, 8, 16, Math.PI]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* Left ear cup */}
          <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* Right ear cup */}
          <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          {/* Cushions */}
          <mesh position={[-0.1, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
            <meshStandardMaterial color="#333" roughness={0.9} />
          </mesh>
          <mesh position={[0.1, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
            <meshStandardMaterial color="#333" roughness={0.9} />
          </mesh>
        </group>
      );

    case 'books':
      return (
        <group>
          {[0, 0.03, 0.06].map((offset, i) => (
            <mesh key={i} position={[offset * 2, 0.1 + offset, 0]} castShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial color={i === 0 ? color : i === 1 ? "#654321" : "#8B4513"} roughness={0.7} />
            </mesh>
          ))}
        </group>
      );

    case 'notebook':
      return (
        <mesh castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
      );

    case 'pen':
      const penR = dimensions?.radius ?? 0.003;
      const penH = dimensions?.height ?? 0.12;
      return (
        <group>
          <mesh position={[0, penH/2, 0]} castShadow>
            <cylinderGeometry args={[penR, penR, penH * 0.83, 8]} />
            <meshStandardMaterial color={color} roughness={0.2} />
          </mesh>
          <mesh position={[0, penH * 0.83, 0]}>
            <coneGeometry args={[penR, penH * 0.17, 8]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        </group>
      );

    case 'phone':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.03, 0.003]}>
            <planeGeometry args={[w * 0.8, h * 0.8]} />
            <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.2} />
          </mesh>
        </group>
      );

    case 'tablet':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.003]}>
            <planeGeometry args={[w * 0.92, h * 0.94]} />
            <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.3} />
          </mesh>
        </group>
      );

    case 'webcam':
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.04, d/2 + 0.001]}>
            <cylinderGeometry args={[w * 0.25, w * 0.25, 0.01, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[w * 1.33, 0.01, d * 1.33]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      );

    case 'microphone':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      );

    case 'clock':
      return (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.015, 32]} />
            <meshStandardMaterial color={color} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.008, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.002, 32]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Hour hand */}
          <mesh position={[0, 0.009, 0.03]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.002, 0.03, 0.002]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          {/* Minute hand */}
          <mesh position={[0, 0.009, 0.04]} rotation={[0, 0, Math.PI / 3]}>
            <boxGeometry args={[0.002, 0.04, 0.002]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      );

    case 'poster':
      return (
        <group>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.003]}>
            <planeGeometry args={[w * 0.94, h * 0.96]} />
            <meshStandardMaterial color="#1e40af" />
          </mesh>
        </group>
      );

    case 'cable-tray':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* Sides */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[w, 0.01, d]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      );

    case 'monitor-stand':
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
  }
};

export default function WorkspaceObject3D({ object }: Props) {
  const groupRef = useRef<Group>(null);
  const selectObject = useWorkspaceStore((state) => state.selectObject);
  const selectedId = useWorkspaceStore((state) => state.selectedId);
  const selectedIds = useWorkspaceStore((state) => state.selectedIds);
  const isSelected = selectedId === object.id;
  const isMultiSelected = selectedIds.includes(object.id);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (e.button === 2 || e.nativeEvent?.button === 2) {
      return;
    }
    const multi = e.ctrlKey || e.metaKey || e.shiftKey;
    selectObject(object.id, multi);
  };

  const handleContextMenu = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    contextMenuState.setShow(true, object.id, {
      x: e.clientX,
      y: e.clientY,
    });
  };

  // For desk, don't apply Y scale to preserve leg height
  // Apply scale only to width/depth, keep height fixed
  const shouldSkipYScale = object.type === 'desk';
  const adjustedScale: [number, number, number] = shouldSkipYScale 
    ? [object.scale[0], 1, object.scale[2]] 
    : object.scale;

  return (
    <group
      ref={groupRef}
      position={object.position}
      rotation={object.rotation}
      scale={adjustedScale}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <ObjectGeometry 
        type={object.type} 
        color={object.color} 
        dimensions={object.dimensions} 
        material={object.material}
        properties={object.properties}
      />
      {isMultiSelected && (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial 
            color={isSelected ? "#22d3ee" : "#64748b"} 
            wireframe 
            transparent 
            opacity={isSelected ? 0.5 : 0.3} 
          />
        </mesh>
      )}
    </group>
  );
}

