/**
 *
 * @param {number} n total number of cities
 * @param {[number,number,number][]} flights flight chart [from_i, to_i, price_i]
 * @param {number} src source city
 * @param {number} dst destination city
 * @param {number} k max stops in between
 * @returns {number} cheapest price
 */
function findCheapestPrice(n, flights, src, dst, k) {
  // construct a flight chart from flight list
  const flightChart = flights.reduce(
    (
      /** @type {Map<number, Map<number, number>>} */
      map,
      [from_i, to_i, price_i]
    ) => {
      /** @type {Map<number, number>} */
      const destinationPriceMap = map.get(from_i) ?? new Map();
      map.set(from_i, destinationPriceMap);

      destinationPriceMap.set(to_i, price_i);

      return map;
    },
    new Map()
  );

  return getCheapestPrice(src, 0);

  // TODO: memoize price map??

  /**
   *
   * @param {number} i start
   * @param {number} j end
   * @param {number} stops stops
   */
  function getCheapestPrice(i, stops) {
    const priceMap = flightChart.get(i);

    // no route available
    if (!priceMap) return -1;

    // if destination available, last flight
    if (priceMap.has(dst)) return priceMap.get(dst);

    // max stops passed
    if (stops === k) return -1;

    let cheapestPrice = -1;
    for (const [j, currentPrice] of priceMap) {
      const nextFlight = getCheapestPrice(j, stops + 1);

      // no routes found
      if (nextFlight === -1) continue;

      const totalPrice = currentPrice + nextFlight;

      if (cheapestPrice === -1) {
        cheapestPrice = totalPrice;
        continue;
      }

      if (cheapestPrice <= totalPrice) continue;

      cheapestPrice = totalPrice;
    }

    return cheapestPrice;
  }
}

// Test case 1
const flights1 = [
  [0, 1, 100],
  [1, 2, 100],
  [2, 0, 100],
  [1, 3, 600],
  [2, 3, 200],
];
console.log(
  "Actual: " + findCheapestPrice(4, flights1, 0, 3, 1) + ", Expected: 700"
);

// Test case 2
const flights2 = [
  [0, 1, 100],
  [1, 2, 100],
  [2, 0, 100],
  [1, 3, 600],
  [2, 3, 200],
];
console.log(
  "Actual: " + findCheapestPrice(4, flights2, 0, 3, 0) + ", Expected: -1"
);

// Test case 3
const flights3 = [
  [0, 1, 100],
  [1, 2, 100],
  [2, 0, 100],
  [1, 3, 600],
  [2, 3, 200],
];
console.log(
  "Actual: " + findCheapestPrice(3, flights3, 0, 2, 0) + ", Expected: 500"
);
