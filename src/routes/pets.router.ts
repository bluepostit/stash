import { FastifyPlugin } from "fastify";
import { default as fp } from 'fastify-plugin'

const plugin: FastifyPlugin = async (fastify, _options, next) => {
  fastify.get('/pets', async (_request, reply) => {
    return reply.code(200).send(['dog', 'cat'])
  })

  next()
}

export default fp(plugin)
