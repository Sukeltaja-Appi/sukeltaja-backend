
// ms: milliseconds
const sleep = (ms) => {
  /*eslint-disable */
  return new Promise(resolve => setTimeout(resolve, ms))
  /*eslint-enable */
}

// This dictionary is used to keep track of what objects are being edited
// currently and shouldnt be edited elsewere currently.
let dbObjectsInUse ={}

module.exports = {
  sleep,
  dbObjectsInUse
}
