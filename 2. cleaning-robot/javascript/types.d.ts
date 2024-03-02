export type Position = { x: number; y: number };
export type Direction = Record<"UP" | "DOWN" | "LEFT" | "RIGHT", Symbol>;

export type RobotApi = {
  move: () => void;
  turnLeft: () => void;
  turnRight: () => void;
  getDirection: () => Direction;
  isBarrierAhead: () => boolean;
  getPosition: () => Position;
  getPositionAhead: () => Position;
};

export type ShortestPath = {
  steps: number;
  direction: import("./types.js").Direction;
};

export type ShortestPathCollection = Map<string, ShortestPath>;
