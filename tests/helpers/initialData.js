const initialUsers = {
  'SamiSukeltaja': {
    username: 'SamiSukeltaja',
    password: '123123salasana',
    email: 'eitoimiva@email.com'
  },
  'KalleKalastaja': {
    username: 'KalleKalastaja',
    password: '123123salasana',
    email: 'eitoimiva@email.com'
  }
}

const initialEvents = [
  {
    title: 'Sukellusseuran kokous',
  },
  {
    title: 'Toinen tapahtumani'
  },
  {
    title: 'Kolmas tapahtuma'
  }
]

const initialTargets = [
  {
    'name': 'Ruotohylky',
    'type': 'Hylky',
    'depth': '17',
    'latitude': '59.95756592',
    'longitude': '24.37135085',
    'user_created': 'false'
  }
]

const initialDives = [
  {
    startdate: '2019-01-15T13:03:22.014Z',
    enddate: '2019-01-15T14:12:25.128Z',
    longitude: '60.5525',
    latitude: '24.1232',
  }
]

const nonExistingEventId = '5c64d88b9488480ee36731fc'

module.exports = {
  initialUsers,
  initialEvents,
  initialTargets,
  initialDives,
  nonExistingEventId
}
