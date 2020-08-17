import passport from 'passport'
import passportLocal from 'passport-local'
import User from '../models/user'

const findUser = (userName: string) => {
  return User
    .query()
    .findOne({ email: userName })
}

passport.use(new passportLocal.Strategy(
  async (userName: string, password: string, callback) => {
    console.log('here we go!')
    try {
      console.log('trying to auth')
      const user = await findUser(userName)
      if (!user) {
        return callback(null, false)
      }

      const match = await user.checkPassword(password)
      if (match) {
        return callback(null, user)
      } else {
        return callback(null, false)
      }
    } catch (err) {
      return callback(err)
    }
  }
))
