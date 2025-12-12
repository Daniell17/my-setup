import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { findOptimalCablePath, pathToArray } from "@/utils/cableRouting";
import {
  createArrangementPlan,
  generateCableConnections,
} from "@/utils/autoArrange";

export type ObjectType =
  | "desk"
  | "monitor"
  | "pc-tower"
  | "lamp"
  | "speaker"
  | "plant"
  | "keyboard"
  | "mouse"
  | "chair"
  | "shelf"
  | "mug"
  | "headphones"
  | "books"
  | "notebook"
  | "pen"
  | "phone"
  | "tablet"
  | "webcam"
  | "microphone"
  | "clock"
  | "poster"
  | "cable-tray"
  | "monitor-stand";

export interface WorkspaceObject {
  id: string;
  type: ObjectType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    [key: string]: number | undefined;
  };
  material?: {
    type: "standard" | "wood" | "metal" | "plastic" | "fabric" | "glass";
    textureUrl?: string;
    color?: string; // Override base color if needed
  };
  modelUrl?: string;
  properties?: {
    roughness?: number;
    metalness?: number;
    opacity?: number;
    transparent?: boolean;
  };
  price?: number;
  groupId?: string;
}

export interface WorkspaceGroup {
  id: string;
  name: string;
  objectIds: string[];
}

export interface SavedLayout {
  id: string;
  name: string;
  objects: WorkspaceObject[];
  createdAt: number;
  updatedAt: number;
}

interface HistoryState {
  objects: WorkspaceObject[];
  selectedId: string | null;
}

interface WorkspaceState {
  objects: WorkspaceObject[];
  selectedId: string | null;
  selectedIds: string[];
  transformMode: "translate" | "rotate" | "scale" | "walk";
  history: HistoryState[];
  historyIndex: number;
  maxHistorySize: number;
  snapToGrid: boolean;
  gridSize: number;

  // Actions
  addObject: (type: ObjectType, overrides?: Partial<WorkspaceObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null, multi?: boolean) => void;
  clearSelection: () => void;
  updateObject: (id: string, updates: Partial<WorkspaceObject>) => void;
  setTransformMode: (mode: "translate" | "rotate" | "scale" | "walk") => void;
  clearWorkspace: () => void;
  duplicateObject: (id: string) => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Grid Snapping
  setSnapToGrid: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  snapValue: (value: number) => number;

  // Alignment
  alignObjects: (
    axis: "x" | "y" | "z",
    alignment: "min" | "center" | "max"
  ) => void;
  distributeObjects: (axis: "x" | "y" | "z") => void;

  // Smart Features
  smartSurfaceDetection: boolean;
  setSmartSurfaceDetection: (enabled: boolean) => void;
  snapToSurface: (objectId: string) => void;
  autoStack: (objectId: string) => void;

  // Cable Management
  cableManagementMode: boolean;
  setCableManagementMode: (enabled: boolean) => void;
  cables: Array<{
    id: string;
    from: string;
    to: string;
    path: [number, number, number][];
  }>;
  addCable: (from: string, to: string) => void;
  removeCable: (id: string) => void;
  tidyCables: () => void;
  tidyWorkspace: () => void;

  // Lighting
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;

  // Layout Management
  saveLayout: (name: string, isPublic?: boolean) => Promise<string>;
  loadLayout: (id: string) => void;
  deleteLayout: (id: string) => void;
  getSavedLayouts: () => SavedLayout[];
  importLayout: (objects: WorkspaceObject[]) => void;

  // Room Environment
  room: {
    width: number;
    depth: number;
    height: number;
    wallVisible: boolean;
    floorColor: string;
  };
  updateRoom: (updates: Partial<WorkspaceState["room"]>) => void;

  // Budget
  budget: number;
  setBudget: (budget: number) => void;

  // Grouping
  groups: WorkspaceGroup[];
  groupObjects: (ids: string[]) => void;
  ungroupObjects: (ids: string[]) => void;

  // Measurement Tools
  measurementMode: boolean;
  setMeasurementMode: (enabled: boolean) => void;
}

const getDefaultDimensions = (
  type: ObjectType
): WorkspaceObject["dimensions"] => {
  const defaults: Record<ObjectType, WorkspaceObject["dimensions"]> = {
    desk: { width: 2, height: 0.05, depth: 1 },
    monitor: { width: 0.8, height: 0.5, depth: 0.03 },
    "pc-tower": { width: 0.2, height: 0.45, depth: 0.4 },
    lamp: { width: 0.15, height: 0.4, depth: 0.15 },
    speaker: { width: 0.15, height: 0.3, depth: 0.15 },
    plant: { width: 0.2, height: 0.35, depth: 0.2 },
    keyboard: { width: 0.45, height: 0.02, depth: 0.15 },
    mouse: { width: 0.08, height: 0.03, depth: 0.12 },
    chair: { width: 0.5, height: 0.6, depth: 0.5 },
    shelf: { width: 1, height: 0.03, depth: 0.25 },
    mug: { width: 0.08, height: 0.1, depth: 0.08, radius: 0.04 },
    headphones: { width: 0.25, height: 0.25, depth: 0.1 },
    books: { width: 0.12, height: 0.15, depth: 0.08 },
    notebook: { width: 0.18, height: 0.005, depth: 0.13 },
    pen: { width: 0.01, height: 0.12, depth: 0.01, radius: 0.003 },
    phone: { width: 0.05, height: 0.1, depth: 0.005 },
    tablet: { width: 0.13, height: 0.18, depth: 0.005 },
    webcam: { width: 0.06, height: 0.03, depth: 0.06 },
    microphone: { width: 0.05, height: 0.2, depth: 0.05, radius: 0.02 },
    clock: { width: 0.15, height: 0.15, depth: 0.015, radius: 0.07 },
    poster: { width: 0.48, height: 0.68, depth: 0.005 },
    "cable-tray": { width: 0.75, height: 0.03, depth: 0.08 },
    "monitor-stand": { width: 0.55, height: 0.08, depth: 0.25 },
  };
  return defaults[type];
};

const objectDefaults: Record<
  ObjectType,
  { name: string; color: string; scale: [number, number, number] }
> = {
  desk: { name: "Desk", color: "#8B4513", scale: [2, 0.05, 1] },
  monitor: { name: "Monitor", color: "#1a1a2e", scale: [0.8, 0.5, 0.05] },
  "pc-tower": { name: "PC Tower", color: "#2d2d2d", scale: [0.3, 0.6, 0.5] },
  lamp: { name: "Desk Lamp", color: "#f4d03f", scale: [0.15, 0.4, 0.15] },
  speaker: { name: "Speaker", color: "#333333", scale: [0.2, 0.35, 0.2] },
  plant: { name: "Plant", color: "#228B22", scale: [0.2, 0.35, 0.2] },
  keyboard: { name: "Keyboard", color: "#404040", scale: [0.5, 0.03, 0.18] },
  mouse: { name: "Mouse", color: "#303030", scale: [0.08, 0.03, 0.12] },
  chair: { name: "Chair", color: "#1a1a1a", scale: [0.6, 1.2, 0.6] },
  shelf: { name: "Shelf", color: "#654321", scale: [1, 0.05, 0.3] },
  mug: { name: "Coffee Mug", color: "#ffffff", scale: [0.08, 0.1, 0.08] },
  headphones: {
    name: "Headphones",
    color: "#1a1a1a",
    scale: [0.25, 0.25, 0.1],
  },
  books: {
    name: "Books",
    color: "#8B4513",
    scale: [0.15, 0.2, 0.12],
  },
  notebook: {
    name: "Notebook",
    color: "#ffffff",
    scale: [0.2, 0.01, 0.15],
  },
  pen: {
    name: "Pen",
    color: "#000000",
    scale: [0.01, 0.12, 0.01],
  },
  phone: {
    name: "Phone",
    color: "#1a1a1a",
    scale: [0.06, 0.12, 0.01],
  },
  tablet: {
    name: "Tablet",
    color: "#1a1a1a",
    scale: [0.15, 0.2, 0.01],
  },
  webcam: {
    name: "Webcam",
    color: "#2d2d2d",
    scale: [0.08, 0.05, 0.08],
  },
  microphone: {
    name: "Microphone",
    color: "#333333",
    scale: [0.05, 0.2, 0.05],
  },
  clock: {
    name: "Clock",
    color: "#ffffff",
    scale: [0.15, 0.15, 0.02],
  },
  poster: {
    name: "Poster",
    color: "#1a1a2e",
    scale: [0.5, 0.7, 0.01],
  },
  "cable-tray": {
    name: "Cable Tray",
    color: "#404040",
    scale: [0.8, 0.05, 0.1],
  },
  "monitor-stand": {
    name: "Monitor Stand",
    color: "#2d2d2d",
    scale: [0.6, 0.1, 0.3],
  },
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      objects: [],
      selectedId: null,
      selectedIds: [],
      transformMode: "translate",
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      snapToGrid: false,
      gridSize: 0.5,
      smartSurfaceDetection: true,
      cableManagementMode: false,
      cables: [],
      timeOfDay: 12,

      pushHistory: () => {
        const state = get();
        const newHistory: HistoryState = {
          objects: JSON.parse(JSON.stringify(state.objects)),
          selectedId: state.selectedId,
        };

        const history = state.history.slice(0, state.historyIndex + 1);
        history.push(newHistory);

        if (history.length > state.maxHistorySize) {
          history.shift();
        }

        set({
          history,
          historyIndex: history.length - 1,
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const prevState = state.history[state.historyIndex - 1];
          set({
            objects: JSON.parse(JSON.stringify(prevState.objects)),
            selectedId: prevState.selectedId,
            historyIndex: state.historyIndex - 1,
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const nextState = state.history[state.historyIndex + 1];
          set({
            objects: JSON.parse(JSON.stringify(nextState.objects)),
            selectedId: nextState.selectedId,
            historyIndex: state.historyIndex + 1,
          });
        }
      },

      canUndo: () => {
        return get().historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      addObject: (type, overrides) => {
        get().pushHistory();
        const defaults = objectDefaults[type];
        const dimensions = getDefaultDimensions(type);
        const newObject: WorkspaceObject = {
          id: uuidv4(),
          type,
          name: defaults.name,
          position: type === "desk" ? [0, 0, 0] : [0, defaults.scale[1] / 2, 0],
          rotation: [0, 0, 0],
          scale: defaults.scale,
          color: defaults.color,
          dimensions,
          material: {
            type: "standard",
          },
          properties: {
            roughness: 0.5,
            metalness: 0.5,
          },
          price: 0,
          ...overrides, // Apply any overrides (like modelUrl)
        };
        set((state) => ({
          objects: [...state.objects, newObject],
          selectedId: newObject.id,
        }));
      },

      removeObject: (id) => {
        get().pushHistory();
        set((state) => ({
          objects: state.objects.filter((obj) => obj.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
          selectedIds: state.selectedIds.filter(
            (selectedId) => selectedId !== id
          ),
        }));
      },

      selectObject: (id, multi = false) => {
        if (!id) {
          set({ selectedId: null, selectedIds: [] });
          return;
        }

        const state = get();
        const obj = state.objects.find((o) => o.id === id);

        // If object belongs to a group, select the whole group (unless special key? for now always select group)
        let idsToSelect = [id];
        if (obj?.groupId) {
          const groupMembers = state.objects.filter(
            (o) => o.groupId === obj.groupId
          );
          idsToSelect = groupMembers.map((o) => o.id);
        }

        if (multi) {
          // If already selected, deselect all group members
          const firstId = idsToSelect[0];
          const isAlreadySelected = state.selectedIds.includes(firstId);

          if (isAlreadySelected) {
            const newIds = state.selectedIds.filter(
              (sid) => !idsToSelect.includes(sid)
            );
            set({
              selectedIds: newIds,
              selectedId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
            });
          } else {
            // Add group to selection
            // Avoid duplicates
            const newIds = Array.from(
              new Set([...state.selectedIds, ...idsToSelect])
            );
            set({
              selectedIds: newIds,
              selectedId: id, // Primary selection
            });
          }
        } else {
          // Single selection (group becomes the selection)
          set({ selectedId: id, selectedIds: idsToSelect });
        }
      },

      clearSelection: () => {
        set({ selectedId: null, selectedIds: [] });
      },

      updateObject: (id, updates) => {
        const state = get();
        const obj = state.objects.find((o) => o.id === id);
        if (obj) {
          const hasSignificantChange =
            JSON.stringify(obj.position) !== JSON.stringify(updates.position) ||
            JSON.stringify(obj.rotation) !== JSON.stringify(updates.rotation) ||
            JSON.stringify(obj.scale) !== JSON.stringify(updates.scale);

          if (hasSignificantChange && !state.history.length) {
            state.pushHistory();
          }
        }
        set((state) => ({
          objects: state.objects.map((obj) =>
            obj.id === id ? { ...obj, ...updates } : obj
          ),
        }));
      },

      setTransformMode: (mode) => {
        set({ transformMode: mode });
      },

      clearWorkspace: () => {
        get().pushHistory();
        set({ objects: [], selectedId: null });
      },

      duplicateObject: (id) => {
        get().pushHistory();
        const obj = get().objects.find((o) => o.id === id);
        if (obj) {
          const newObject: WorkspaceObject = {
            ...obj,
            id: uuidv4(),
            name: `${obj.name} (copy)`,
            position: [
              obj.position[0] + 0.5,
              obj.position[1],
              obj.position[2] + 0.5,
            ],
          };
          set((state) => ({
            objects: [...state.objects, newObject],
            selectedId: newObject.id,
          }));
        }
      },

      saveLayout: async (name, isPublic = false) => {
        const layoutId = uuidv4();

        // Generate thumbnail
        let thumbnailUrl = "";
        try {
          const { generateThumbnail } = await import(
            "@/utils/thumbnailGenerator"
          );
          thumbnailUrl = await generateThumbnail(400, 300);
        } catch (error) {
          console.error("Failed to generate thumbnail:", error);
        }

        const layout: SavedLayout = {
          id: layoutId,
          name,
          objects: get().objects,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const layouts = JSON.parse(
          localStorage.getItem("workspace-layouts") || "[]"
        );
        layouts.push(layout);
        localStorage.setItem("workspace-layouts", JSON.stringify(layouts));

        // Also save to API if connected
        import("@/services/api").then(({ api }) => {
          api.saveLayout(name, get().objects, isPublic).catch(console.error);
        });

        return layoutId;
      },

      loadLayout: (id) => {
        const layouts = JSON.parse(
          localStorage.getItem("workspace-layouts") || "[]"
        );
        const layout = layouts.find((l: SavedLayout) => l.id === id);
        if (layout) {
          set({
            objects: layout.objects,
            selectedId: null,
          });
        }
      },

      deleteLayout: (id) => {
        const layouts = JSON.parse(
          localStorage.getItem("workspace-layouts") || "[]"
        );
        const filtered = layouts.filter((l: SavedLayout) => l.id !== id);
        localStorage.setItem("workspace-layouts", JSON.stringify(filtered));
      },

      getSavedLayouts: () => {
        return JSON.parse(localStorage.getItem("workspace-layouts") || "[]");
      },

      importLayout: (objects) => {
        get().pushHistory();
        set({
          objects,
          selectedId: null,
        });
      },

      setSnapToGrid: (enabled) => {
        set({ snapToGrid: enabled });
      },

      setGridSize: (size) => {
        set({ gridSize: Math.max(0.1, Math.min(2, size)) });
      },

      snapValue: (value) => {
        const state = get();
        if (!state.snapToGrid) return value;
        return Math.round(value / state.gridSize) * state.gridSize;
      },

      alignObjects: (axis, alignment) => {
        const state = get();
        if (state.selectedIds.length < 2) return;

        get().pushHistory();

        const selectedObjects = state.objects.filter((obj) =>
          state.selectedIds.includes(obj.id)
        );
        const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;

        let targetValue: number;
        if (alignment === "min") {
          targetValue = Math.min(
            ...selectedObjects.map((obj) => obj.position[axisIndex])
          );
        } else if (alignment === "max") {
          targetValue = Math.max(
            ...selectedObjects.map((obj) => obj.position[axisIndex])
          );
        } else {
          targetValue =
            selectedObjects.reduce(
              (sum, obj) => sum + obj.position[axisIndex],
              0
            ) / selectedObjects.length;
        }

        selectedObjects.forEach((obj) => {
          const newPosition = [...obj.position] as [number, number, number];
          newPosition[axisIndex] = targetValue;
          state.updateObject(obj.id, { position: newPosition });
        });
      },

      distributeObjects: (axis) => {
        const state = get();
        if (state.selectedIds.length < 3) return;

        get().pushHistory();

        const selectedObjects = state.objects.filter((obj) =>
          state.selectedIds.includes(obj.id)
        );
        const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;

        selectedObjects.sort(
          (a, b) => a.position[axisIndex] - b.position[axisIndex]
        );

        const min = selectedObjects[0].position[axisIndex];
        const max =
          selectedObjects[selectedObjects.length - 1].position[axisIndex];
        const step = (max - min) / (selectedObjects.length - 1);

        selectedObjects.forEach((obj, index) => {
          const newPosition = [...obj.position] as [number, number, number];
          newPosition[axisIndex] = min + step * index;
          state.updateObject(obj.id, { position: newPosition });
        });
      },

      setSmartSurfaceDetection: (enabled) => {
        set({ smartSurfaceDetection: enabled });
      },

      snapToSurface: (objectId) => {
        const state = get();
        const obj = state.objects.find((o) => o.id === objectId);
        if (!obj) return;

        const desks = state.objects.filter((o) => o.type === "desk");
        const threshold = 0.5;

        for (const desk of desks) {
          const deskTop = desk.position[1] + desk.scale[1] / 2;
          const distance = Math.sqrt(
            Math.pow(obj.position[0] - desk.position[0], 2) +
              Math.pow(obj.position[2] - desk.position[2], 2)
          );

          if (distance < threshold && obj.position[1] < deskTop + 0.3) {
            const newPosition: [number, number, number] = [
              desk.position[0],
              deskTop + obj.scale[1] / 2,
              desk.position[2],
            ];

            let newRotation = [...obj.rotation] as [number, number, number];
            if (obj.type === "monitor") {
              newRotation[0] = -0.1;
            }

            state.updateObject(objectId, {
              position: newPosition,
              rotation: newRotation,
            });
            break;
          }
        }
      },

      autoStack: (objectId) => {
        const state = get();
        get().pushHistory();
        const obj = state.objects.find((o) => o.id === objectId);
        if (!obj) return;

        const desks = state.objects.filter((o) => o.type === "desk");
        if (desks.length === 0) return;
        const desk = desks[0];

        const deskTop = desk.position[1] + desk.scale[1] / 2;
        const deskLeft = desk.position[0] - desk.scale[0] / 2;
        const deskRight = desk.position[0] + desk.scale[0] / 2;
        const deskBack = desk.position[2] - desk.scale[2] / 2;

        switch (obj.type) {
          case "pc-tower":
            state.updateObject(objectId, {
              position: [
                deskLeft + 0.3,
                desk.position[1] - 0.1,
                deskBack - 0.2,
              ],
              rotation: [0, Math.PI / 4, 0],
            });
            break;

          case "speaker":
            const speakers = state.objects.filter(
              (o) => o.type === "speaker" && o.id !== objectId
            );
            if (speakers.length === 0) {
              state.updateObject(objectId, {
                position: [
                  deskLeft + 0.3,
                  deskTop + obj.scale[1] / 2,
                  desk.position[2],
                ],
              });
            } else {
              state.updateObject(objectId, {
                position: [
                  deskRight - 0.3,
                  deskTop + obj.scale[1] / 2,
                  desk.position[2],
                ],
              });
            }
            break;

          case "monitor-stand":
            state.updateObject(objectId, {
              position: [
                desk.position[0],
                deskTop + obj.scale[1] / 2,
                desk.position[2],
              ],
            });
            break;

          case "cable-tray":
            state.updateObject(objectId, {
              position: [
                desk.position[0],
                desk.position[1] - 0.15,
                deskBack - 0.05,
              ],
            });
            break;

          default:
            break;
        }
      },

      setCableManagementMode: (enabled) => {
        set({ cableManagementMode: enabled });
      },

      addCable: (from, to) => {
        const state = get();
        const fromObj = state.objects.find((o) => o.id === from);
        const toObj = state.objects.find((o) => o.id === to);
        if (!fromObj || !toObj) return;

        const desk = state.objects.find((o) => o.type === "desk");
        const optimalPath = findOptimalCablePath(
          fromObj,
          toObj,
          state.objects,
          desk || undefined
        );
        const path = pathToArray(optimalPath);

        set((state) => ({
          cables: [...state.cables, { id: uuidv4(), from, to, path }],
        }));
      },

      removeCable: (id) => {
        set((state) => ({
          cables: state.cables.filter((c) => c.id !== id),
        }));
      },

      tidyCables: () => {
        const state = get();
        get().pushHistory();
        const desk = state.objects.find((o) => o.type === "desk");

        // Auto-detect and create cables for common connections
        const pcTower = state.objects.find((o) => o.type === "pc-tower");
        const monitor = state.objects.find((o) => o.type === "monitor");
        const speakers = state.objects.filter((o) => o.type === "speaker");
        const keyboard = state.objects.find((o) => o.type === "keyboard");
        const mouse = state.objects.find((o) => o.type === "mouse");
        const webcam = state.objects.find((o) => o.type === "webcam");
        const microphone = state.objects.find((o) => o.type === "microphone");

        const newCables: Array<{
          id: string;
          from: string;
          to: string;
          path: [number, number, number][];
        }> = [];

        // Monitor to PC
        if (monitor && pcTower) {
          const exists = state.cables.some(
            (c) =>
              (c.from === monitor.id && c.to === pcTower.id) ||
              (c.from === pcTower.id && c.to === monitor.id)
          );
          if (!exists) {
            newCables.push({
              id: uuidv4(),
              from: monitor.id,
              to: pcTower.id,
              path: [],
            });
          }
        }

        // Speakers to PC
        if (pcTower) {
          speakers.forEach((speaker) => {
            const exists = state.cables.some(
              (c) =>
                (c.from === speaker.id && c.to === pcTower.id) ||
                (c.from === pcTower.id && c.to === speaker.id)
            );
            if (!exists) {
              newCables.push({
                id: uuidv4(),
                from: speaker.id,
                to: pcTower.id,
                path: [],
              });
            }
          });
        }

        // Keyboard to PC
        if (keyboard && pcTower) {
          const exists = state.cables.some(
            (c) =>
              (c.from === keyboard.id && c.to === pcTower.id) ||
              (c.from === pcTower.id && c.to === keyboard.id)
          );
          if (!exists) {
            newCables.push({
              id: uuidv4(),
              from: keyboard.id,
              to: pcTower.id,
              path: [],
            });
          }
        }

        // Mouse to PC
        if (mouse && pcTower) {
          const exists = state.cables.some(
            (c) =>
              (c.from === mouse.id && c.to === pcTower.id) ||
              (c.from === pcTower.id && c.to === mouse.id)
          );
          if (!exists) {
            newCables.push({
              id: uuidv4(),
              from: mouse.id,
              to: pcTower.id,
              path: [],
            });
          }
        }

        // Webcam to PC
        if (webcam && pcTower) {
          const exists = state.cables.some(
            (c) =>
              (c.from === webcam.id && c.to === pcTower.id) ||
              (c.from === pcTower.id && c.to === webcam.id)
          );
          if (!exists) {
            newCables.push({
              id: uuidv4(),
              from: webcam.id,
              to: pcTower.id,
              path: [],
            });
          }
        }

        // Microphone to PC
        if (microphone && pcTower) {
          const exists = state.cables.some(
            (c) =>
              (c.from === microphone.id && c.to === pcTower.id) ||
              (c.from === pcTower.id && c.to === microphone.id)
          );
          if (!exists) {
            newCables.push({
              id: uuidv4(),
              from: microphone.id,
              to: pcTower.id,
              path: [],
            });
          }
        }

        // Combine existing and new cables
        const allCables = [...state.cables, ...newCables];

        // Update all cable paths using smart routing
        const updatedCables = allCables.map((cable) => {
          const fromObj = state.objects.find((o) => o.id === cable.from);
          const toObj = state.objects.find((o) => o.id === cable.to);
          if (!fromObj || !toObj) return cable;

          const optimalPath = findOptimalCablePath(
            fromObj,
            toObj,
            state.objects,
            desk
          );
          const path = pathToArray(optimalPath);

          return { ...cable, path };
        });

        set({ cables: updatedCables });
      },

      tidyWorkspace: () => {
        const state = get();
        get().pushHistory();

        if (state.objects.length === 0) return;

        // Create arrangement plan for all objects
        const arrangementPlan = createArrangementPlan(state.objects);

        // Apply arrangement to all objects
        const updatedObjects = state.objects.map((obj) => {
          const arrangement = arrangementPlan[obj.id];
          if (arrangement) {
            return {
              ...obj,
              position: arrangement.position,
              rotation: arrangement.rotation,
            };
          }
          return obj;
        });

        // Generate cable connections
        const cableConnections = generateCableConnections(updatedObjects);
        const desk = updatedObjects.find((o) => o.type === "desk");

        // Create new cables from connections
        const newCables = cableConnections
          .map((conn) => {
            // Check if cable already exists
            const exists = state.cables.some(
              (c) =>
                (c.from === conn.from && c.to === conn.to) ||
                (c.from === conn.to && c.to === conn.from)
            );
            if (exists) return null;

            const fromObj = updatedObjects.find((o) => o.id === conn.from);
            const toObj = updatedObjects.find((o) => o.id === conn.to);
            if (!fromObj || !toObj) return null;

            const optimalPath = findOptimalCablePath(
              fromObj,
              toObj,
              updatedObjects,
              desk || undefined
            );
            const path = pathToArray(optimalPath);

            return {
              id: uuidv4(),
              from: conn.from,
              to: conn.to,
              path,
            };
          })
          .filter((c) => c !== null) as Array<{
          id: string;
          from: string;
          to: string;
          path: [number, number, number][];
        }>;

        // Update existing cables with new paths based on new positions
        const updatedCables = [...state.cables, ...newCables].map((cable) => {
          const fromObj = updatedObjects.find((o) => o.id === cable.from);
          const toObj = updatedObjects.find((o) => o.id === cable.to);
          if (!fromObj || !toObj) return cable;

          const optimalPath = findOptimalCablePath(
            fromObj,
            toObj,
            updatedObjects,
            desk || undefined
          );
          const path = pathToArray(optimalPath);

          return { ...cable, path };
        });

        set({
          objects: updatedObjects,
          cables: updatedCables,
        });
      },

      setTimeOfDay: (time) => {
        set({ timeOfDay: Math.max(0, Math.min(24, time)) });
      },

      room: {
        width: 4,
        depth: 4,
        height: 3,
        wallVisible: true,
        floorColor: "#1a1a1a",
      },

      updateRoom: (updates) => {
        set((state) => ({
          room: { ...state.room, ...updates },
        }));
      },

      budget: 0,
      setBudget: (budget) => set({ budget }),

      groups: [],
      groupObjects: (ids) => {
        if (ids.length < 2) return;
        get().pushHistory();
        const groupId = uuidv4();
        const groupName = `Group ${get().groups.length + 1}`;
        const newGroup: WorkspaceGroup = {
          id: groupId,
          name: groupName,
          objectIds: ids,
        };

        set((state) => ({
          groups: [...state.groups, newGroup],
          objects: state.objects.map((obj) =>
            ids.includes(obj.id) ? { ...obj, groupId } : obj
          ),
          selectedId: ids[0], // Keep one selected or select all?
          selectedIds: ids,
        }));
      },

      ungroupObjects: (ids) => {
        get().pushHistory();
        const state = get();
        // Find groups affected
        const affectedGroups = new Set<string>();
        const objectsToUngroup = state.objects.filter(
          (obj) => ids.includes(obj.id) && obj.groupId
        );

        objectsToUngroup.forEach((obj) => {
          if (obj.groupId) affectedGroups.add(obj.groupId);
        });

        set((state) => ({
          groups: state.groups.filter((g) => !affectedGroups.has(g.id)),
          objects: state.objects.map((obj) =>
            affectedGroups.has(obj.groupId!)
              ? { ...obj, groupId: undefined }
              : obj
          ),
        }));
      },

      measurementMode: false,
      setMeasurementMode: (enabled) => set({ measurementMode: enabled }),
    }),
    {
      name: "workspace-storage",
    }
  )
);
