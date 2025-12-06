import { WorkspaceObject } from '@/store/workspaceStore';

export const compressLayout = (objects: WorkspaceObject[]): string => {
  try {
    const json = JSON.stringify(objects);
    return btoa(json);
  } catch (e) {
    console.error('Failed to compress layout', e);
    return '';
  }
};

export const decompressLayout = (compressed: string): WorkspaceObject[] | null => {
  try {
    const json = atob(compressed);
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decompress layout', e);
    return null;
  }
};

