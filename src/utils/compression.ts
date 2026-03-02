import { WorkspaceObject } from "@/store/workspaceStore";
import type { CanonicalScene } from "@/types/scene";
import {
  fromCanonicalScene,
  toCanonicalScene,
  type WorkspaceRoom,
} from "@/utils/sceneSerializer";

export const compressScene = (scene: CanonicalScene): string => {
  try {
    const json = JSON.stringify(scene);
    return btoa(json);
  } catch (e) {
    console.error("Failed to compress scene", e);
    return "";
  }
};

export const decompressScene = (compressed: string): CanonicalScene | null => {
  try {
    const json = atob(compressed);
    return JSON.parse(json) as CanonicalScene;
  } catch (e) {
    console.error("Failed to decompress scene", e);
    return null;
  }
};

export const compressLayout = (
  objects: WorkspaceObject[],
  room?: WorkspaceRoom
): string => {
  try {
    const scene = room
      ? toCanonicalScene(objects, room)
      : ({
          schemaVersion: "1.0",
          units: "meters",
          room: {
            width: 4,
            depth: 4,
            height: 3,
            wallVisible: true,
            floorColor: "#1a1a1a",
          },
          objects: objects.map((obj) =>
            toCanonicalScene(objects, {
              width: 4,
              depth: 4,
              height: 3,
              wallVisible: true,
              floorColor: "#1a1a1a",
            }).objects.find((o) => o.id === obj.id)
          ).filter(Boolean),
        } as CanonicalScene);

    return compressScene(scene);
  } catch (e) {
    console.error("Failed to compress layout", e);
    return "";
  }
};

export const decompressLayout = (
  compressed: string
): WorkspaceObject[] | null => {
  try {
    const json = atob(compressed);
    const parsed = JSON.parse(json);

    if (Array.isArray(parsed)) {
      return parsed as WorkspaceObject[];
    }

    const scene = parsed as CanonicalScene;
    const { objects } = fromCanonicalScene(scene);
    return objects;
  } catch (e) {
    console.error("Failed to decompress layout", e);
    return null;
  }
};

