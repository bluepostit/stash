import { FastifyPlugin, FastifySchema } from "fastify"
import fp from "fastify-plugin"

interface LoginBody {
  userName: string
  password: string
}

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['user-name', 'password'],
    properties: {
      'user-name': {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    }
  }
}

const plugin: FastifyPlugin = async (fastify, _options, done) => {
  fastify.post<{ Body: LoginBody }>("/login",
    { schema },
    async (_request, _reply) => {

      return {
        message: "Not implemented yet",
      }
    })

  done()
}

export default fp(plugin)
