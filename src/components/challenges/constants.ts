export const WORLD = { w: 640, h: 416 };
export const INSET = 22;

export const COLORS = {
  background: "#e6eef1",
  ink: "#1a242c",
  slate: "#324450",
  slateDeep: "#243844",
  bronze: "#734d15",
  rust: "#6a2e11",
  mist: "#5d7380",
  frame: "#b7c4c8",
  ramp: "#8fa3ab",
  string: "#a9b8be",
};

export const CHALLENGES = [
  {
    id: "gravity",
    caption: "Create a world with gravity",
  },
  {
    id: "shapes",
    caption: "Add multiple types of objects",
  },
  {
    id: "drag",
    caption: "Add mouse dragging",
  },
  {
    id: "count",
    caption: "Adjust numbers of bodies dynamically",
  },
  {
    id: "collision",
    caption: "Collision Detection",
  },
  {
    id: "forces",
    caption: "Additional Forces",
  },
  {
    id: "connect",
    caption: "Connect bodies",
  },
  {
    id: "stats",
    caption: "Show stats",
  },
] as const;

export type ChallengeId = (typeof CHALLENGES)[number]["id"];

export const STEP = 1000 / 60;
export const STEP_SQUARED = STEP * STEP;
