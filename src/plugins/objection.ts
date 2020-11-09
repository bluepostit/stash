import { FastifyPluginCallback, preHandlerHookHandler } from 'fastify'
import fp from 'fastify-plugin'
import Knex from 'knex'
import { Model } from 'objection'
import knex from '../config/knex'
import * as models from '../models'

interface RequestWithId {
  id: number
}

const plugin: FastifyPluginCallback = async (fastify, _options, _done) => {
  const buildSetEntity = (entityClass: typeof Model) => {
    const fn: preHandlerHookHandler = async (request, _reply, done) => {
      const params = request.params as RequestWithId
      if (!params || !params.id) {
        const error = fastify.httpErrors.badRequest(
          `You must provide an ID for this ${entityClass.name}`
        )
        done(error)
      }
      let query = entityClass.query().findById(params.id)
      if (entityClass.modifiers['defaultSelects']) {
        query = query.modify('defaultSelects')
      }
      const entity = await query
      if (!entity) {
        const error = fastify.httpErrors.notFound(
          `No ${entityClass.name} found with that ID`
        )
        done(error)
      }
      request.entity = entity
      done()
    }
    return fn
  }

  fastify.decorateRequest('entity', '')

  fastify.decorate('db', {
    knex,
    models,
    buildSetEntity,
  })
}

export default fp(plugin, {
  name: 'db',
})

declare module 'fastify' {
  interface FastifyInstance {
    db: {
      knex: Knex
      models: {
        [index: string]: typeof Model
      }
      /**
       * Get a hook function which looks up an entity in the database by its
       * id (as specified in `request.params`).
       * The found entity will be set as `request.entity`.
       * If no entity is found, or if no id is given in `request.params`,
       * an error will be thrown.
       *
       * @param entityClass the class of the entity to use when retrieving
       * @returns preHandler hook function, curried to use `entityClass`
       */
      buildSetEntity(entityClass: typeof Model): preHandlerHookHandler
    }
  }

  interface FastifyRequest {
    /**
     * A `Model` instance representing the entity requested by its id.
     */
    entity: Model | undefined
  }
}
