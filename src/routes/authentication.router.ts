import { FastifyPlugin, FastifySchema } from "fastify"
import fp from "fastify-plugin"
import { User } from '../models'

interface LoginBody {
  username: string
  password: string
}

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      'username': {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User | undefined
  }
}

const plugin: FastifyPlugin = async (fastify, _options, done) => {
  fastify.post<{ Body: LoginBody }>("/login",
    { schema },
    async (request, _reply) => {
      if (request.session.authenticated) {
        return {
          message: 'You are already logged in'
        }
      }
      const { username: userName, password } = request.body
      const UserClass = (fastify.db.User as typeof User)
      const user = await UserClass
        .query()
        .findOne({
          email: userName.trim()
        })

      if (!user) {
        throw fastify.httpErrors.unauthorized(
          'Please check your credentials')
      }

      const correctPassword = await user.checkPassword(password)
      if (!correctPassword) {
        throw fastify.httpErrors.unauthorized(
          "Please check your credentials")
      }

      request.session.authenticated = true
      request.user = user
      return {
        message: "Login successful",
      }
    })

  done()
}

export default fp(plugin)
