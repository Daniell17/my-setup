import { Vector3 } from "three";

interface WorkspaceObject {
  id: string;
  type: string;
  position: [number, number, number];
  scale: [number, number, number];
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    [key: string]: number | undefined;
  };
}

interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

// Get anchor point for object (where cable connects)
export function getAnchorPoint(obj: WorkspaceObject): Vector3 {
  const pos = new Vector3(...obj.position);
  const dimensions = obj.dimensions || {};
  const scale = obj.scale || [1, 1, 1];

  switch (obj.type) {
    case "monitor":
      return pos
        .clone()
        .add(new Vector3(0, 0, -(dimensions.depth || scale[2]) / 2));

    case "pc-tower":
      return pos
        .clone()
        .add(
          new Vector3(
            0,
            (dimensions.height || scale[1]) / 4,
            (dimensions.depth || scale[2]) / 2
          )
        );

    case "speaker":
      return pos
        .clone()
        .add(new Vector3(0, 0, -(dimensions.depth || scale[2]) / 2));

    case "keyboard":
    case "mouse":
      return pos
        .clone()
        .add(
          new Vector3(
            0,
            -(dimensions.height || scale[1]) / 2,
            (dimensions.depth || scale[2]) / 2
          )
        );

    case "webcam":
    case "microphone":
      return pos
        .clone()
        .add(new Vector3(0, -(dimensions.height || scale[1]) / 2, 0));

    default:
      return pos;
  }
}

// Get bounding box for an object
function getBoundingBox(obj: WorkspaceObject): BoundingBox {
  const pos = new Vector3(...obj.position);
  const dimensions = obj.dimensions || {};
  const scale = obj.scale || [1, 1, 1];
  const width = (dimensions.width || scale[0]) / 2;
  const height = (dimensions.height || scale[1]) / 2;
  const depth = (dimensions.depth || scale[2]) / 2;

  return {
    minX: pos.x - width,
    maxX: pos.x + width,
    minY: pos.y - height,
    maxY: pos.y + height,
    minZ: pos.z - depth,
    maxZ: pos.z + depth,
  };
}

// Check if a line segment intersects with a bounding box
function lineIntersectsBox(
  start: Vector3,
  end: Vector3,
  box: BoundingBox
): boolean {
  // Check if segment intersects box in any dimension
  const dir = end.clone().sub(start);
  const dirLen = dir.length();
  if (dirLen < 0.001) return false;
  dir.normalize();

  // Use ray-box intersection algorithm
  let tmin = 0;
  let tmax = dirLen;

  for (let i = 0; i < 3; i++) {
    const axis = i === 0 ? "x" : i === 1 ? "y" : "z";
    const min = axis === "x" ? box.minX : axis === "y" ? box.minY : box.minZ;
    const max = axis === "x" ? box.maxX : axis === "y" ? box.maxY : box.maxZ;
    const origin = start[axis];
    const direction = dir[axis];

    if (Math.abs(direction) < 0.001) {
      // Parallel to plane
      if (origin < min || origin > max) return false;
    } else {
      const ood = 1 / direction;
      let t1 = (min - origin) * ood;
      let t2 = (max - origin) * ood;

      if (t1 > t2) [t1, t2] = [t2, t1];

      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);

      if (tmin > tmax) return false;
    }
  }

  return tmin < dirLen && tmax > 0;
}

// Check if a path segment collides with any objects
function checkCollision(
  start: Vector3,
  end: Vector3,
  objects: WorkspaceObject[],
  excludeIds: string[]
): WorkspaceObject | null {
  for (const obj of objects) {
    if (excludeIds.includes(obj.id)) continue;

    const box = getBoundingBox(obj);
    if (lineIntersectsBox(start, end, box)) {
      return obj;
    }
  }
  return null;
}

// Find shortest path avoiding obstacles
export function findOptimalCablePath(
  fromObj: WorkspaceObject,
  toObj: WorkspaceObject,
  allObjects: WorkspaceObject[],
  desk?: WorkspaceObject
): Vector3[] {
  const fromAnchor = getAnchorPoint(fromObj);
  const toAnchor = getAnchorPoint(toObj);
  const excludeIds = [fromObj.id, toObj.id];

  // Try direct path first
  const directCollision = checkCollision(
    fromAnchor,
    toAnchor,
    allObjects,
    excludeIds
  );

  if (!directCollision) {
    // Direct path is clear - use it
    return [fromAnchor, toAnchor];
  }

  // Direct path blocked - need to route around/under
  const paths: { path: Vector3[]; length: number }[] = [];

  // Strategy 1: Route under desk if desk exists
  if (desk) {
    const deskPos = new Vector3(...desk.position);
    const dimensions = desk.dimensions || {};
    const scale = desk.scale || [1, 1, 1];
    const deskBottom = deskPos.y - (dimensions.height || scale[1]) / 2 - 0.1;

    // Path: from -> down to desk bottom -> along to destination -> up to to
    const path1: Vector3[] = [
      fromAnchor.clone(),
      new Vector3(fromAnchor.x, deskBottom, fromAnchor.z),
      new Vector3(toAnchor.x, deskBottom, toAnchor.z),
      toAnchor.clone(),
    ];

    // Check if this path collides (excluding desk)
    let path1Valid = true;
    for (let i = 0; i < path1.length - 1; i++) {
      const collision = checkCollision(path1[i], path1[i + 1], allObjects, [
        fromObj.id,
        toObj.id,
        desk.id,
      ]);
      if (collision && collision.type !== "desk") {
        path1Valid = false;
        break;
      }
    }

    if (path1Valid) {
      const length = calculatePathLength(path1);
      paths.push({ path: path1, length });
    }
  }

  // Strategy 2: Route around obstacles - go down first, then around
  const downLevel = Math.min(fromAnchor.y, toAnchor.y) - 0.3;
  const path2: Vector3[] = [
    fromAnchor.clone(),
    new Vector3(fromAnchor.x, downLevel, fromAnchor.z),
    new Vector3(toAnchor.x, downLevel, toAnchor.z),
    toAnchor.clone(),
  ];

  let path2Valid = true;
  for (let i = 0; i < path2.length - 1; i++) {
    const collision = checkCollision(
      path2[i],
      path2[i + 1],
      allObjects,
      excludeIds
    );
    if (collision) {
      // Try to route around the obstacle
      const obstacle = collision;
      const box = getBoundingBox(obstacle);

      // Determine best side to go around
      const fromX = path2[i].x;
      const toX = path2[i + 1].x;
      const fromZ = path2[i].z;
      const toZ = path2[i + 1].z;

      // Choose side with more space
      const leftDist = Math.abs(fromX - box.minX);
      const rightDist = Math.abs(fromX - box.maxX);
      const frontDist = Math.abs(fromZ - box.maxZ);
      const backDist = Math.abs(fromZ - box.minZ);

      const minDist = Math.min(leftDist, rightDist, frontDist, backDist);
      let waypoint: Vector3;

      if (minDist === leftDist) {
        waypoint = new Vector3(box.minX - 0.1, downLevel, (fromZ + toZ) / 2);
      } else if (minDist === rightDist) {
        waypoint = new Vector3(box.maxX + 0.1, downLevel, (fromZ + toZ) / 2);
      } else if (minDist === frontDist) {
        waypoint = new Vector3((fromX + toX) / 2, downLevel, box.maxZ + 0.1);
      } else {
        waypoint = new Vector3((fromX + toX) / 2, downLevel, box.minZ - 0.1);
      }

      // Insert waypoint to avoid obstacle
      path2.splice(i + 1, 0, waypoint);
      i++; // Skip the waypoint we just added
    }
  }

  if (path2Valid) {
    const length = calculatePathLength(path2);
    paths.push({ path: path2, length });
  }

  // Strategy 3: L-shaped path (go horizontally first, then vertically, or vice versa)
  const midY = (fromAnchor.y + toAnchor.y) / 2;
  const path3a: Vector3[] = [
    fromAnchor.clone(),
    new Vector3(fromAnchor.x, midY, fromAnchor.z),
    new Vector3(toAnchor.x, midY, fromAnchor.z),
    new Vector3(toAnchor.x, midY, toAnchor.z),
    toAnchor.clone(),
  ];

  const path3b: Vector3[] = [
    fromAnchor.clone(),
    new Vector3(fromAnchor.x, midY, fromAnchor.z),
    new Vector3(fromAnchor.x, midY, toAnchor.z),
    new Vector3(toAnchor.x, midY, toAnchor.z),
    toAnchor.clone(),
  ];

  for (const path of [path3a, path3b]) {
    let valid = true;
    for (let i = 0; i < path.length - 1; i++) {
      const collision = checkCollision(
        path[i],
        path[i + 1],
        allObjects,
        excludeIds
      );
      if (collision) {
        valid = false;
        break;
      }
    }
    if (valid) {
      const length = calculatePathLength(path);
      paths.push({ path, length });
    }
  }

  // Return shortest valid path
  if (paths.length > 0) {
    paths.sort((a, b) => a.length - b.length);
    return paths[0].path;
  }

  // Fallback: return direct path even if it collides
  return [fromAnchor, toAnchor];
}

// Calculate total length of a path
function calculatePathLength(path: Vector3[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += path[i].distanceTo(path[i + 1]);
  }
  return total;
}

// Convert Vector3[] to [number, number, number][]
export function pathToArray(path: Vector3[]): [number, number, number][] {
  return path.map((v) => [v.x, v.y, v.z]);
}
