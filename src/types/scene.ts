export type Vec3 = [number, number, number];

export interface CanonicalTransform {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
}

export interface CanonicalSceneObject {
  id: string;
  assetId?: string;
  transform: CanonicalTransform;
  materialOverrides?: {
    color?: string;
    textureUrl?: string;
    roughness?: number;
    metalness?: number;
    opacity?: number;
    transparent?: boolean;
    // Allow future-safe extension
    [key: string]: unknown;
  };
  metadata?: Record<string, unknown>;
  provenance?: {
    sourceLayoutId?: string;
    sourceObjectId?: string;
    createdBy?: string;
    [key: string]: unknown;
  };
}

export interface CanonicalRoom {
  width: number;
  depth: number;
  height: number;
  wallVisible: boolean;
  floorColor: string;
  // Extra room-level metadata is allowed
  [key: string]: unknown;
}

export interface CanonicalScene {
  schemaVersion: "1.0";
  units: "meters";
  room: CanonicalRoom;
  objects: CanonicalSceneObject[];
  metadata?: Record<string, unknown>;
}

