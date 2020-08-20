import { FastifyPlugin } from 'fastify'
import fp from 'fastify-plugin'

const plugin: FastifyPlugin = async (fastify, _options, done) => {
  fastify.addSchema({
    $id: 'messageResponse',
    type: 'object',
    required: ['message'],
    properties: {
      message: { type: 'string' },
    },
  })

  done()
}

export default fp(plugin)
