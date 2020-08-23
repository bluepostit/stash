import { FastifyPlugin } from "fastify";
import fp from 'fastify-plugin'
import { Item, User } from "../models";

const plugin: FastifyPlugin = async (fastify, _options, done) => {
  fastify.get('/items',
  {
    preHandler: fastify.auth.mustBeSignedIn
  },
  async (request, _reply) => {
    const user = request.session.user as User
    const items = await user
      .$relatedQuery('items')
      .modify('defaultSelects')
    return {
      items
    }
  })

  fastify.get('/items/:id',
  {
    preHandler: [
      fastify.auth.mustBeSignedIn,
      // Returns a preHandler function
      fastify.db.buildSetEntity(Item),
      fastify.auth.authorizeEntity
    ]
  },
  async (request, _reply) => {
    return {
      item: request.entity
    }
  })

  done()
}

export default fp(plugin)
