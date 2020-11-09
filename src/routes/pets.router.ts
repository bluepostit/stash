import { FastifyPluginCallback } from "fastify";
import { default as fp } from 'fastify-plugin'

const plugin: FastifyPluginCallback = async (fastify, _options, next) => {
  fastify.get('/pets', async (_request, reply) => {
    return reply.code(200).send(['dog', 'cat'])
  })

  fastify.get('/pets/:id', async (_request, _reply) => {
    throw fastify.httpErrors.notImplemented()
  })

  next()
}

export default fp(plugin)
