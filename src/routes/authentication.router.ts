import { FastifyPluginCallback, FastifySchema } from 'fastify'
import fp from 'fastify-plugin'
import { User } from '../models'

interface LoginBody {
  username: string
  password: string
}

interface SignUpBody {
  username: string
  password: string
  password2: string
}

const loginSchema: FastifySchema = {
  body: { $ref: 'loginRequestBody#' },
}

const signUpSchema: FastifySchema = {
  body: { $ref: 'signUpRequestBody#' },
  response: {
    200: { $ref: 'messageResponse#' },
  },
}

const plugin: FastifyPluginCallback = async (fastify, _options, done) => {
  fastify.post<{ Body: LoginBody }>(
    '/login',
    { schema: loginSchema },
    async (request, _reply) => {
      if (request.session.user) {
        return {
          message: 'You are already logged in',
        }
      }
      const { username: userName, password } = request.body
      const UserClass = fastify.db.models.User as typeof User
      const user = await UserClass.query().findOne({
        email: userName.trim(),
      })

      if (!user) {
        throw fastify.httpErrors.unauthorized('Please check your credentials')
      }

      const correctPassword = await user.checkPassword(password)
      if (!correctPassword) {
        throw fastify.httpErrors.unauthorized('Please check your credentials')
      }

      request.session.user = user
      return {
        message: 'Login successful',
      }
    }
  )

  /**
   * Uses callback-style promises because of an inflexible API
   * of fastify-session (request.destroySession)
   */
  fastify.get('/logout', (request, reply) => {
    request.destroySession((err) => {
      if (err) {
        throw fastify.httpErrors.internalServerError()
      }
      reply.send({
        message: 'Logout successful',
      })
    })
  })

  fastify.post<{ Body: SignUpBody }>(
    '/sign-up',
    { schema: signUpSchema },
    async (request, _reply) => {
      const { username: email, password } = request.body
      const foundUser = await User.query().findOne({
        email,
      })
      if (foundUser) {
        throw fastify.httpErrors.badRequest(
          'A user already exists with this user-name'
        )
      }

      await User.query().insert({
        email,
        password
      })

      return {
        message: 'Sign-up successful',
      }
    }
  )

  done()
}

export default fp(plugin)
