
// ms: milliseconds
const sleep = (ms) => {
  /*eslint-disable */
  return new Promise(resolve => setTimeout(resolve, ms))
  /*eslint-enable */
}

module.exports = {
  sleep
}
