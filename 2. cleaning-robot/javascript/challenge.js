// Robot controller implementation

import { robotControl, Direction } from "./robot-api.js";

const rc = robotControl("../resources/room-layout-1.txt");
const api = rc.robotApi;
cleanRooms(api);
rc.evaluateResult();

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
