import '../config/knex'
import { FastifyPlugin } from 'fastify'
import fp from 'fastify-plugin'
import { Model } from 'objection'
import * as models from '../models'

const plugin: FastifyPlugin = async (fastify, _options, _done) => {
  fastify.decorate("db", models)
}

export default fp(plugin, {
  name: 'db'
})

declare module 'fastify' {
  interface FastifyInstance {
    db: {
      [index: string]: typeof Model
    }
  }
}
