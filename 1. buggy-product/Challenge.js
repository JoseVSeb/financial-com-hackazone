// versions would be a 1D array with either '0' or '1' as its elements.
// '0' indicates the version is bug-free and '1' indicates the version is buggy.
// (Ex - For input [0, 0, 1, 1, 1], the bug was introduced in version 2 and the function should return 1)

/**
 *
 * @param {number[]} versions
 * @returns {number} last bug-free version
 */
function lastBugFreeVersion(versions) {
  for (let i = 0; i < versions.length; i++) {
    // current version is bug free
    if (versions[i] === 0) continue;

    // if all versions had bug, NOTE: outside question criteria
    if (i === 0) throw new Error("All versions have bug.");

    // current version has bug, last bug free version is the previous version
    return i - 1;
  }
  // all versions are bug free, NOTE: outside question criteria
  throw new Error("Bug does not exist.");
}

console.log(lastBugFreeVersion([0, 0, 1, 1, 1]));
