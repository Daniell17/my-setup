import type { WorkspaceObject } from "@/store/workspaceStore";
import type {
  CanonicalRoom,
  CanonicalScene,
  CanonicalSceneObject,
} from "@/types/scene";

export interface WorkspaceRoom {
  width: number;
  depth: number;
  height: number;
  wallVisible: boolean;
  floorColor: string;
}

function toCanonicalObject(obj: WorkspaceObject): CanonicalSceneObject {
  return {
    id: obj.id,
    assetId: obj.modelUrl,
    transform: {
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
    },
    materialOverrides: {
      color: obj.material?.color ?? obj.color,
      textureUrl: obj.material?.textureUrl,
      roughness: obj.properties?.roughness,
      metalness: obj.properties?.metalness,
      opacity: obj.properties?.opacity,
      transparent: obj.properties?.transparent,
    },
    metadata: {
      type: obj.type,
      name: obj.name,
      price: obj.price,
      dimensions: obj.dimensions,
      groupId: obj.groupId,
      modelUrl: obj.modelUrl,
    },
  };
}

function fromCanonicalObject(obj: CanonicalSceneObject): WorkspaceObject {
  const metadata = (obj.metadata ?? {}) as Record<string, unknown>;

  const type = (metadata.type as string | undefined) || "desk";
  const name =
    (metadata.name as string | undefined) ||
    (typeof obj.assetId === "string" ? obj.assetId : type);
  const price =
    typeof metadata.price === "number"
      ? (metadata.price as number)
      : undefined;

  const dimensions = metadata.dimensions as WorkspaceObject["dimensions"];
  const groupId = metadata.groupId as string | undefined;
  const modelUrl =
    (metadata.modelUrl as string | undefined) ||
    (typeof obj.assetId === "string" ? obj.assetId : undefined);

  return {
    id: obj.id,
    type,
    name,
    position: obj.transform.position,
    rotation: obj.transform.rotation,
    scale: obj.transform.scale,
    color: obj.materialOverrides?.color ?? "#ffffff",
    dimensions,
    material: {
      type: "standard",
      textureUrl: obj.materialOverrides?.textureUrl,
      color: obj.materialOverrides?.color,
    },
    properties: {
      roughness: obj.materialOverrides?.roughness,
      metalness: obj.materialOverrides?.metalness,
      opacity: obj.materialOverrides?.opacity,
      transparent: obj.materialOverrides?.transparent,
    },
    price,
    groupId,
    modelUrl,
  };
}

export function toCanonicalScene(
  objects: WorkspaceObject[],
  room: WorkspaceRoom,
  metadata?: Record<string, unknown>
): CanonicalScene {
  const canonicalRoom: CanonicalRoom = {
    width: room.width,
    depth: room.depth,
    height: room.height,
    wallVisible: room.wallVisible,
    floorColor: room.floorColor,
  };

  return {
    schemaVersion: "1.0",
    units: "meters",
    room: canonicalRoom,
    objects: objects.map(toCanonicalObject),
    metadata,
  };
}

export function fromCanonicalScene(
  scene: CanonicalScene,
  fallbackRoom?: WorkspaceRoom
): { objects: WorkspaceObject[]; room: WorkspaceRoom } {
  const room: WorkspaceRoom = {
    width: typeof scene.room.width === "number" ? scene.room.width : fallbackRoom?.width ?? 4,
    depth: typeof scene.room.depth === "number" ? scene.room.depth : fallbackRoom?.depth ?? 4,
    height: typeof scene.room.height === "number" ? scene.room.height : fallbackRoom?.height ?? 3,
    wallVisible:
      typeof scene.room.wallVisible === "boolean"
        ? scene.room.wallVisible
        : fallbackRoom?.wallVisible ?? true,
    floorColor:
      typeof scene.room.floorColor === "string"
        ? scene.room.floorColor
        : fallbackRoom?.floorColor ?? "#1a1a1a",
  };

  const objects = scene.objects.map(fromCanonicalObject);

  return { objects, room };
}

