const DateTime = require('luxon').DateTime

const handleEndDate = (startdate, enddate) => {
  // don't allow enddate to be less than or equal to startdate
  if (!enddate || enddate <= startdate) {
    if (typeof startdate === 'string') {
      return DateTime.fromISO(startdate).plus({ hours: 1 }).toJSDate()
    }

    return DateTime.fromJSDate(startdate).plus({ hours: 1 }).toJSDate()
  }

  return enddate
}

module.exports = handleEndDate
