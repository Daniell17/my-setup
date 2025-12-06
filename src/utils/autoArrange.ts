import { WorkspaceObject } from "@/store/workspaceStore";

interface ArrangementPlan {
  [objectId: string]: {
    position: [number, number, number];
    rotation: [number, number, number];
  };
}

interface CableConnection {
  from: string;
  to: string;
}

export function createArrangementPlan(
  objects: WorkspaceObject[]
): ArrangementPlan {
  const plan: ArrangementPlan = {};

  // Find desk as center point
  const desk = objects.find((o) => o.type === "desk");

  if (!desk) {
    // If no desk, center everything around origin
    return {};
  }

  const deskWidth = desk.scale[0];
  const deskDepth = desk.scale[2];

  // Desk rendering structure (from WorkspaceObject3D.tsx):
  // - Desk origin is at floor level (Y=0)
  // - Legs are 0.73m tall, positioned at Y=LEG_HEIGHT/2 so they extend from floor (0) to LEG_HEIGHT (0.73)
  // - Desk surface center is at SURFACE_Y = LEG_HEIGHT + deskH/2 = 0.73 + 0.025 = 0.755 relative to desk origin
  const DESK_LEG_HEIGHT = 0.73;
  const DESK_SURFACE_THICKNESS = 0.05;
  const DESK_ORIGIN_Y = 0; // Desk origin is at floor level
  const DESK_SURFACE_TOP = DESK_LEG_HEIGHT + DESK_SURFACE_THICKNESS; // 0.78 - top of desk surface

  // Room boundaries (default: 4x4x3)
  // Make sure desk fits - if desk is too large, scale it down or move it away from walls
  const ROOM_WIDTH = 4;
  const ROOM_DEPTH = 4;
  const WALL_OFFSET = 0.2; // Keep objects away from walls (increased for safety)

  // Position desk against back wall, centered horizontally
  // Ensure desk doesn't extend beyond room boundaries
  const minDeskX = -ROOM_WIDTH / 2 + deskWidth / 2 + WALL_OFFSET;
  const maxDeskX = ROOM_WIDTH / 2 - deskWidth / 2 - WALL_OFFSET;

  let deskX = 0;
  let deskZ = -ROOM_DEPTH / 2 + deskDepth / 2 + WALL_OFFSET; // Position against back wall

  // Constrain desk X position to fit within room
  if (deskWidth > ROOM_WIDTH - 2 * WALL_OFFSET) {
    // Desk is too wide - center it but ensure it doesn't go through walls
    deskX = 0;
  } else {
    // Center desk horizontally but keep within bounds
    deskX = Math.max(minDeskX, Math.min(maxDeskX, 0));
  }

  // Ensure desk Z position doesn't go through walls
  deskZ = Math.max(
    -ROOM_DEPTH / 2 + deskDepth / 2 + WALL_OFFSET,
    Math.min(ROOM_DEPTH / 2 - deskDepth / 2 - WALL_OFFSET, deskZ)
  );

  plan[desk.id] = {
    position: [deskX, DESK_ORIGIN_Y, deskZ],
    rotation: [0, 0, 0],
  };

  // Desk surface top - desk origin is at floor, surface is at LEG_HEIGHT + thickness
  const deskTop = DESK_SURFACE_TOP;
  const deskLeft = deskX - deskWidth / 2;
  const deskRight = deskX + deskWidth / 2;
  const deskFront = deskZ + deskDepth / 2;
  const deskBack = deskZ - deskDepth / 2;
  const centerX = deskX;
  const centerZ = deskZ;

  // Categorize objects (excluding desk)
  const otherObjects = objects.filter((o) => o.id !== desk.id);
  const monitors = otherObjects.filter((o) => o.type === "monitor");
  const pcTowers = otherObjects.filter((o) => o.type === "pc-tower");
  const keyboards = otherObjects.filter((o) => o.type === "keyboard");
  const mice = otherObjects.filter((o) => o.type === "mouse");
  const speakers = otherObjects.filter((o) => o.type === "speaker");
  const lamps = otherObjects.filter((o) => o.type === "lamp");
  const plants = otherObjects.filter((o) => o.type === "plant");
  const chairs = otherObjects.filter((o) => o.type === "chair");
  const webcams = otherObjects.filter((o) => o.type === "webcam");
  const microphones = otherObjects.filter((o) => o.type === "microphone");
  const headphones = otherObjects.filter((o) => o.type === "headphones");
  const mugs = otherObjects.filter((o) => o.type === "mug");
  const notebooks = otherObjects.filter((o) => o.type === "notebook");
  const phones = otherObjects.filter((o) => o.type === "phone");
  const tablets = otherObjects.filter((o) => o.type === "tablet");
  const books = otherObjects.filter((o) => o.type === "books");
  const pens = otherObjects.filter((o) => o.type === "pen");
  const clocks = otherObjects.filter((o) => o.type === "clock");
  const posters = otherObjects.filter((o) => o.type === "poster");
  const cableTrays = otherObjects.filter((o) => o.type === "cable-tray");
  const monitorStands = otherObjects.filter((o) => o.type === "monitor-stand");
  const shelves = otherObjects.filter((o) => o.type === "shelf");

  // Arrange monitors - centered on desk, back edge
  // Monitor structure: origin at center of stand (Y=0), base at Y=-0.07 with height 0.02
  // Base bottom is at Y=-0.08 from monitor origin. To sit on desk: monitor origin Y = deskTop + 0.08
  monitors.forEach((monitor, index) => {
    const monitorWidth = monitor.scale[0];
    const spacing = 0.25;
    const totalWidth =
      monitors.length * monitorWidth + (monitors.length - 1) * spacing;
    const startX = centerX - totalWidth / 2 + monitorWidth / 2;

    // Monitor base bottom is at Y=-0.08 relative to monitor origin
    // To sit on desk: monitor origin Y = deskTop + 0.08
    const monitorOriginY = deskTop + 0.08;

    plan[monitor.id] = {
      position: [
        startX + index * (monitorWidth + spacing),
        monitorOriginY,
        deskBack + 0.25,
      ],
      rotation: [0, 0, 0],
    };
  });

  // Arrange monitor stands - under monitors
  monitorStands.forEach((stand, index) => {
    const standHeight = stand.scale[1];
    plan[stand.id] = {
      position: [
        monitors[index] ? plan[monitors[index].id]?.position[0] || 0 : 0,
        deskTop + standHeight / 2,
        monitors[index]
          ? plan[monitors[index].id]?.position[2] || deskBack + 0.25
          : deskBack + 0.25,
      ],
      rotation: [0, 0, 0],
    };
  });

  // Arrange keyboards - in front of monitors, centered
  keyboards.forEach((keyboard, index) => {
    const keyboardHeight = keyboard.scale[1];
    const monitorX = monitors[index]
      ? plan[monitors[index].id]?.position[0] || 0
      : 0;
    plan[keyboard.id] = {
      position: [monitorX, deskTop + keyboardHeight / 2, deskFront - 0.15],
      rotation: [0, 0, 0],
    };
  });

  // Arrange mice - next to keyboards, on the right side
  mice.forEach((mouse, index) => {
    const mouseHeight = mouse.scale[1];
    const keyboardX = keyboards[index]
      ? plan[keyboards[index].id]?.position[0] || 0
      : 0;
    const keyboardWidth = keyboards[index]?.scale[0] || 0.5;
    plan[mouse.id] = {
      position: [
        keyboardX + keyboardWidth / 2 + mouse.scale[0] / 2 + 0.08,
        deskTop + mouseHeight / 2,
        deskFront - 0.15,
      ],
      rotation: [0, 0, 0],
    };
  });

  // Arrange PC towers - on floor, next to desk (left side)
  pcTowers.forEach((tower, index) => {
    const towerHeight = tower.scale[1];
    const towerWidth = tower.scale[0];

    // Ensure tower stays within room boundaries
    const towerX = Math.max(
      -ROOM_WIDTH / 2 + WALL_OFFSET + towerWidth / 2,
      deskLeft - 0.4 - towerWidth / 2
    );

    plan[tower.id] = {
      position: [
        towerX,
        towerHeight / 2,
        centerZ + (index % 2 === 0 ? -0.15 : 0.15),
      ],
      rotation: [0, Math.PI / 4, 0],
    };
  });

  // Arrange speakers - on desk sides, evenly spaced
  speakers.forEach((speaker, index) => {
    const speakerHeight = speaker.scale[1];
    if (index % 2 === 0) {
      plan[speaker.id] = {
        position: [
          deskLeft + 0.25,
          deskTop + speakerHeight / 2,
          deskBack + 0.2,
        ],
        rotation: [0, Math.PI / 2, 0],
      };
    } else {
      plan[speaker.id] = {
        position: [
          deskRight - 0.25,
          deskTop + speakerHeight / 2,
          deskBack + 0.2,
        ],
        rotation: [0, -Math.PI / 2, 0],
      };
    }
  });

  // Arrange lamps - on desk corners or sides
  lamps.forEach((lamp, index) => {
    const lampHeight = lamp.scale[1];
    if (index === 0) {
      plan[lamp.id] = {
        position: [deskLeft + 0.3, deskTop + lampHeight / 2, deskFront - 0.2],
        rotation: [0, Math.PI / 4, 0],
      };
    } else {
      plan[lamp.id] = {
        position: [deskRight - 0.3, deskTop + lampHeight / 2, deskFront - 0.2],
        rotation: [0, -Math.PI / 4, 0],
      };
    }
  });

  // Arrange webcams - on top of monitors
  webcams.forEach((webcam, index) => {
    const webcamHeight = webcam.scale[1];
    if (monitors[index]) {
      const monitorPos = plan[monitors[index].id]?.position || [
        0,
        deskTop,
        deskBack + 0.25,
      ];
      const monitorHeight = monitors[index].scale[1];
      plan[webcam.id] = {
        position: [
          monitorPos[0],
          monitorPos[1] + monitorHeight / 2 + webcamHeight / 2 + 0.01,
          monitorPos[2],
        ],
        rotation: [0, 0, 0],
      };
    }
  });

  // Arrange microphones - on desk, to the side
  microphones.forEach((mic, index) => {
    const micHeight = mic.scale[1];
    plan[mic.id] = {
      position: [
        deskRight - 0.3,
        deskTop + micHeight / 2,
        deskFront - 0.3 - index * 0.2,
      ],
      rotation: [0, Math.PI / 2, 0],
    };
  });

  // Arrange desk accessories (mugs, notebooks, phones, tablets, pens, books) - organized on desk
  let accessoryX = deskLeft + 0.3;
  let accessoryRow = 0;
  const accessoryZ = deskFront - 0.5;
  const accessorySpacing = 0.15;

  [...mugs, ...notebooks, ...phones, ...tablets, ...pens, ...books].forEach(
    (item) => {
      const itemHeight = item.scale[1];
      const itemWidth = item.scale[0];

      // Check if we need to move to next row
      if (accessoryX + itemWidth / 2 > deskRight - 0.3) {
        accessoryRow++;
        accessoryX = deskLeft + 0.3;
      }

      plan[item.id] = {
        position: [
          accessoryX,
          deskTop + itemHeight / 2,
          accessoryZ - accessoryRow * 0.2,
        ],
        rotation: [0, 0, 0],
      };

      accessoryX += itemWidth + accessorySpacing;
    }
  );

  // Arrange headphones - on desk edge or hook
  headphones.forEach((headphone, index) => {
    const headphoneHeight = headphone.scale[1];
    plan[headphone.id] = {
      position: [
        deskRight - 0.25,
        deskTop + headphoneHeight / 2,
        deskBack + 0.3 + index * 0.2,
      ],
      rotation: [0, Math.PI / 2, 0],
    };
  });

  // Arrange plants - on desk corner or floor near desk
  plants.forEach((plant, index) => {
    const plantHeight = plant.scale[1];
    if (index === 0) {
      plan[plant.id] = {
        position: [deskLeft + 0.3, deskTop + plantHeight / 2, deskBack + 0.25],
        rotation: [0, 0, 0],
      };
    } else {
      plan[plant.id] = {
        position: [
          deskRight + 0.4,
          plantHeight / 2,
          centerZ + (index % 2 === 0 ? -0.25 : 0.25),
        ],
        rotation: [0, 0, 0],
      };
    }
  });

  // Arrange clocks - on wall
  clocks.forEach((clock) => {
    plan[clock.id] = {
      position: [deskRight + 0.6, deskTop + 0.6, centerZ],
      rotation: [0, -Math.PI / 2, 0],
    };
  });

  // Arrange posters - on walls
  posters.forEach((poster, index) => {
    plan[poster.id] = {
      position: [
        centerX + (index % 2 === 0 ? -1.8 : 1.8),
        deskTop + 0.8,
        centerZ,
      ],
      rotation: [0, index % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, 0],
    };
  });

  // Arrange shelves - on walls
  shelves.forEach((shelf, index) => {
    plan[shelf.id] = {
      position: [
        centerX + (index % 2 === 0 ? -1.5 : 1.5),
        deskTop + 0.5 + (index % 3) * 0.35,
        centerZ,
      ],
      rotation: [0, index % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, 0],
    };
  });

  // Arrange cable trays - under desk, at the back
  cableTrays.forEach((tray) => {
    plan[tray.id] = {
      position: [centerX, DESK_ORIGIN_Y - 0.12, deskBack - 0.08],
      rotation: [0, 0, 0],
    };
  });

  // Arrange chairs - in front of desk, centered
  chairs.forEach((chair, index) => {
    const chairHeight = chair.scale[1];
    const chairSpacing = chairs.length > 1 ? 0.9 : 0;
    const startX = (-(chairs.length - 1) * chairSpacing) / 2;

    plan[chair.id] = {
      position: [
        centerX + startX + index * chairSpacing,
        chairHeight / 2,
        deskFront + 0.7,
      ],
      rotation: [0, Math.PI, 0],
    };
  });

  return plan;
}

export function generateCableConnections(
  objects: WorkspaceObject[]
): CableConnection[] {
  const connections: CableConnection[] = [];

  const monitors = objects.filter((o) => o.type === "monitor");
  const pcTowers = objects.filter((o) => o.type === "pc-tower");
  const speakers = objects.filter((o) => o.type === "speaker");
  const keyboards = objects.filter((o) => o.type === "keyboard");
  const mice = objects.filter((o) => o.type === "mouse");
  const webcams = objects.filter((o) => o.type === "webcam");
  const microphones = objects.filter((o) => o.type === "microphone");

  // Monitor to PC
  monitors.forEach((monitor) => {
    if (pcTowers.length > 0) {
      connections.push({
        from: monitor.id,
        to: pcTowers[0].id,
      });
    }
  });

  // Speakers to PC
  speakers.forEach((speaker) => {
    if (pcTowers.length > 0) {
      connections.push({
        from: speaker.id,
        to: pcTowers[0].id,
      });
    }
  });

  // Keyboard to PC
  keyboards.forEach((keyboard) => {
    if (pcTowers.length > 0) {
      connections.push({
        from: keyboard.id,
        to: pcTowers[0].id,
      });
    }
  });

  // Mouse to PC
  mice.forEach((mouse) => {
    if (pcTowers.length > 0) {
      connections.push({
        from: mouse.id,
        to: pcTowers[0].id,
      });
    }
  });

  // Webcam to PC
  webcams.forEach((webcam) => {
    if (pcTowers.length > 0) {
      connections.push({
        from: webcam.id,
        to: pcTowers[0].id,
      });
    }
  });

  // Microphone to PC
  microphones.forEach((mic) => {
    if (pcTowers.length > 0) {
      connections.push({
        from: mic.id,
        to: pcTowers[0].id,
      });
    }
  });

  return connections;
}
