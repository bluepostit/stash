import { FastifyPlugin } from "fastify"
import fp from "fastify-plugin"

const plugin: FastifyPlugin = async (fastify, _options, done) => {
  fastify.post("/login", async (_request, _reply) => {
    return {
      message: "Not implemented yet",
    }
  })

  done()
}

export default fp(plugin)
