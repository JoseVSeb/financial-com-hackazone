// Robot controller implementation

import { robotControl, Direction } from "./robot-api.js";

console.log = () => void 0;
(async () => {
  const [dfsTimeInMs, dijkstraTimeInMs] = await runIterations(
    1000,
    () => {
      const rc = robotControl("../resources/room-layout-1.txt");
      const api = rc.robotApi;
      cleanRooms(api);
      rc.evaluateResult();
    },
    () => {
      const rc = robotControl("../resources/room-layout-1.txt");
      const api = rc.robotApi;
      cleanRoomsV2(api);
      rc.evaluateResult();
    },
  );
  console.info(`DFS: ${dfsTimeInMs}ms\nDijkstra's: ${dijkstraTimeInMs}ms`);
})();

// Robot API
//
// api.move(); // move robot one step forward
// api.turnLeft(); // turn robot 90 degrees to the left
// api.turnRight(); // turn robot 90 degrees to the right
// api.getDirection(); // return the current direction, e.g. Direction.RIGHT
// api.isBarrierAhead(); // true -> barrier ahead
// api.getPosition(); // returns the current robot position, e.g. { x: 1, y: 2 }
// api.getPositionAhead(); // returns the position in front of the robot, doesn't check if a barrier

/**
 *
 * @param {import("./types.js").RobotApi} api
 */
function cleanRooms(api) {
  // Set to keep track of visited positions
  const visited = new Set();

  const stack = [
    { position: api.getPosition(), directions: getDefaultDirections() },
  ];

  while (stack.length > 0) {
    const { position: currentPosition, directions } = stack.at(-1);

    // mark visited
    visited.add(JSON.stringify(currentPosition));

    // no more directions to traverse from here
    if (directions.length === 0) {
      stack.pop();
      if (stack.length === 0) return;

      turnToPosition(currentPosition, stack.at(-1).position);
      api.move();

      continue;
    }

    // current direction
    const currentDirection = directions.pop();
    turnToDirection(currentDirection);

    const nextPosition = api.getPositionAhead();

    // if visited, change direction
    if (visited.has(JSON.stringify(nextPosition))) continue;

    // if barrier, change direction
    if (api.isBarrierAhead()) continue;

    // more forward
    api.move();

    // push to the new position to stack
    stack.push({ position: nextPosition, directions: getDefaultDirections() });
  }

  return;

  /**
   * Turn the robot to face a new position given the current position.
   * This function calculates the direction from the current position to the target position
   * and then turns the robot accordingly.
   *
   * @param {import("./types.js").Position} currentPosition - The current position of the robot.
   * @param {import("./types.js").Position} targetPosition - The target position to face.
   */
  function turnToPosition(currentPosition, targetPosition) {
    const deltaX = targetPosition.x - currentPosition.x;
    const deltaY = targetPosition.y - currentPosition.y;

    if (deltaX === 0 && deltaY === 0) {
      // The robot is already at the target position
      return;
    }

    // Calculate the direction to turn based on deltaX and deltaY
    let targetDirection;
    if (deltaX === 0) {
      // Moving along the y-axis
      targetDirection = deltaY > 0 ? Direction.DOWN : Direction.UP;
    } else if (deltaY === 0) {
      // Moving along the x-axis
      targetDirection = deltaX > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      // Diagonal movement (not supported by basic movements like turnLeft/turnRight)
      throw new Error("Diagonal movement is not supported.");
    }

    // Turn the robot to face the target direction
    turnToDirection(targetDirection);
  }

  /**
   *
   * @returns {Direction[]}
   */
  function getDefaultDirections() {
    return [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];
  }

  /**
   *
   * @param {import("./types.js").Direction} direction
   */
  function turnToDirection(direction) {
    // TODO: can be optimized
    while (direction !== api.getDirection()) {
      api.turnRight();
    }
  }

  /**
   * Get the next position based on the current position and direction
   *
   * @param {import("./types.js").Position} position
   * @param {import("./types.js").Direction} direction
   * @returns {import("./types.js").Position}
   */
  function getNextPosition(position, direction) {
    let { x, y } = position;
    switch (direction) {
      case Direction.NORTH:
        y++;
        break;
      case Direction.EAST:
        x++;
        break;
      case Direction.SOUTH:
        y--;
        break;
      case Direction.WEST:
        x--;
        break;
    }
    return { x, y };
  }

  /**
   * Move the robot back to the previous position
   */
  function goBack() {
    api.turnLeft();
    api.turnLeft();
    api.move();
    api.turnRight();
    api.turnRight();
  }
}

/**
 *
 * @param {import("./types.js").RobotApi} api
 */
function cleanRoomsV2(api) {
  /**
   * for every position, it stores information to travel to every other position with shortest path.
   * this is an implementation of Dijkstra's algorithm.
   * if a better path is found, the information is updated.
   * if a position is found in this map, that means it's visited.
   *
   * @type {Map<string, import("./types.js").ShortestPathCollection>}
   */
  const visited = new Map();
  /**
   * every known but unvisited nodes are found here.
   * use the above map to travel the next unvisited node.
   * @type {Set<string>}
   */
  const unvisited = new Set();

  let current;
  let currentKey;
  do {
    current = api.getPosition();
    currentKey = JSON.stringify(current);
    unvisited.delete(currentKey);

    const paths = getUpdatedMap(current);
    visited.set(currentKey, paths);

    /** @type {import("./types.js").ShortestPath} */
    let shortestPath = null;
    for (const next of unvisited) {
      /** @type {import("./types.js").ShortestPath} */
      const nextPath = paths.get(next);

      if (nextPath.steps === 1) {
        shortestPath = nextPath;
        break;
      }

      if (shortestPath?.steps <= nextPath.steps) continue;

      shortestPath = nextPath;
    }

    if (!shortestPath) return;

    turnToDirection(shortestPath.direction);
    api.move();
  } while (unvisited.size);

  return;

  /**
   *
   * @param {import("./types.js").Direction} direction
   */
  function turnToDirection(direction) {
    // TODO: can be optimized
    while (direction !== api.getDirection()) {
      api.turnRight();
    }
  }

  /**
   *
   * @param {import("./types.js").Position} position
   * @returns {import("./types.js").ShortestPathCollection}
   */
  function getUpdatedMap(position) {
    /**
     * @type {import("./types.js").ShortestPathCollection}
     */
    const paths = new Map();

    let i = 4;
    while (i--) {
      const ahead = api.getPositionAhead();
      const aheadKey = JSON.stringify(ahead);
      if (api.isBarrierAhead()) {
        api.turnRight();
        continue;
      }

      const direction = api.getDirection();
      paths.set(aheadKey, { steps: 1, direction });

      if (!visited.has(aheadKey)) {
        unvisited.add(aheadKey);
        continue;
      }

      for (const [key, aheadPath] of visited.get(aheadKey)) {
        if (key === currentKey) continue;

        const currentPath = paths.get(key);
        if (currentPath?.steps <= aheadPath.steps + 1) continue;

        paths.set(key, { steps: aheadPath.steps + 1, direction });
      }

      api.turnRight();
    }

    return paths;
  }
}

// Function to run the code snippet and measure time
async function runIterations(iterations, ...funcs) {
  let totalElapsedTime = Array.from(funcs, () => 0);
  const { performance } = await import("perf_hooks");

  for (let i = 0; i < iterations; i++) {
    funcs.forEach((func, i) => {
      totalElapsedTime[i] += getElapsed(func);
    });
  }

  return totalElapsedTime.map((el) => el / iterations);

  function getElapsed(func) {
    const startTime = performance.now();
    func();
    const endTime = performance.now();

    const elapsedTime = endTime - startTime;
    return elapsedTime;
  }
}
