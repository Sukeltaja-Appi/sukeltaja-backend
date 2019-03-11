
const userToID = (obj) => {
  if ( typeof obj !== 'undefined' ) {
    if ( typeof obj.id !== 'undefined' ) return obj.id
    if ( typeof obj.user !== 'undefined' ) {
      if ( typeof obj.user._id !== 'undefined' ) return obj.user._id
      if ( typeof obj.user.id !== 'undefined' ) return obj.user.id

      return obj.user
    }
    if ( typeof obj._id !== 'undefined' ) return obj._id
  }

  return obj
}

const userEqualsUser = (user1, user2) => {
  if(typeof user1 === 'undefined' || typeof user2 === 'undefined') return false

  if ( typeof user1.username !== 'undefined'
    && typeof user2.username !== 'undefined' ) {
    return user1.username === user2.username
  }

  let id1 = userToID(user1)
  let id2 = userToID(user1)

  return id1 === id2
}

const userIsInArray = (user, users) => {
  for(let i = 0; i < users.length; i++) {
    if(userEqualsUser(user, users[i])) return true
  }

  return false
}

module.exports = {
  userToID,
  userEqualsUser,
  userIsInArray
}
