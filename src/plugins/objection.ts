import { FastifyPlugin } from 'fastify'
import fp from 'fastify-plugin'
import Knex from 'knex'
import { Model } from 'objection'
import knex from '../config/knex'
import * as models from '../models'

const plugin: FastifyPlugin = async (fastify, _options, _done) => {
  fastify.decorate("db", {
    knex,
    models
  })
}

export default fp(plugin, {
  name: 'db'
})

declare module 'fastify' {
  interface FastifyInstance {
    db: {
      knex: Knex
      models: {
        [index: string]: typeof Model
      }
    }
  }
}
