import { FastifyPlugin } from "fastify";
import fp from 'fastify-plugin'

const plugin: FastifyPlugin = async (fastify, _options, done) => {
  fastify.get('/items', async (_request, _reply) => {
    const itemCount = await fastify.db.Item.query().resultSize()
    return {
      message: 'Not implemented yet',
      items: itemCount
    }
  })

  done()
}

export default fp(plugin)
