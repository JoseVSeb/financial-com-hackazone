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
  const visited = new Set(); // Set to keep track of visited positions
  let maxIterations = 1000; // Maximum number of iterations to prevent infinite loop

  while (maxIterations > 0) {
    const currentPosition = JSON.stringify(api.getPosition());

    // Clean the current cell if not visited before
    if (!visited.has(currentPosition)) {
      visited.add(currentPosition);
    }

    // Move to the next cell if possible
    if (!api.isBarrierAhead()) api.move();

    // If moving forward is not possible, turn right and try again
    api.turnRight();

    if (!api.isBarrierAhead()) api.move();

    // If moving forward is still not possible, turn right again (effectively turning around)
    api.turnRight();

    // If still not possible to move forward, break the loop
    if (api.isBarrierAhead()) break;

    maxIterations--; // Decrement the iteration count
  }

  //   /** @type {Record<number,Record<number, "x" | ".">>} */
  //   const map = {};

  //   //   {
  //   //     const currentPosition = api.getPosition();
  //   //     map[currentPosition.x] = map[currentPosition.x] ?? {};
  //   //     map[currentPosition.x][currentPosition.y] = ".";
  //   //     const aheadPosition = api.getPositionAhead();
  //   //     map[aheadPosition.x] = map[aheadPosition.x] ?? {};
  //   //     map[aheadPosition.x][aheadPosition.y] = api.isBarrierAhead() ? "x" : ".";
  //   //   }
  //   pointUp();
  //   while (!api.isBarrierAhead()) {
  //     api.move();
  //   }
  //   pointRight();
  //   while (!api.isBarrierAhead()) {
  //     api.move();
  //   }

  //   return;
  //   function pointUp() {
  //     if (api.getDirection() === Direction.DOWN) api.turnLeft()
  //     if (api.getDirection() === Direction.RIGHT) api.turnLeft()
  //     if (api.getDirection() === Direction.LEFT) api.turnRight()
  //   }
  //   function pointRight() {
  //     if (api.getDirection() === Direction.LEFT) api.turnLeft()
  //     if (api.getDirection() === Direction.UP) api.turnRight()
  //     if (api.getDirection() === Direction.DOWN) api.turnLeft()
  //   }
  //   function pointLeft() {
  //     if (api.getDirection() === Direction.RIGHT) api.turnLeft()
  //     if (api.getDirection() === Direction.UP) api.turnLeft()
  //     if (api.getDirection() === Direction.DOWN) api.turnRight()
  //   }
  //   function pointDown() {
  //     if (api.getDirection() === Direction.UP) api.turnLeft()
  //     if (api.getDirection() === Direction.LEFT) api.turnLeft()
  //     if (api.getDirection() === Direction.RIGHT) api.turnRight()
  //   }
}
