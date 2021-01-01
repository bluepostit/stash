import { FastifyPluginCallback, FastifyRequest, preHandlerHookHandler } from 'fastify'
import fp from 'fastify-plugin'
import Knex from 'knex'
import { Model } from 'objection'
import knex from '../config/knex'
import * as models from '../models'

interface RequestWithId {
  [key: string]: number
}

const plugin: FastifyPluginCallback = async (fastify, _options, _done) => {
  const getRequestSource = (
      request: FastifyRequest, idKey: string
    ): RequestWithId => {
      const params = request.params as RequestWithId
      const body = request.body as RequestWithId
      let source = params
      if (!params || !params[idKey]) {
        source = body
      }
      return source
  }

  const getRequestEntity = async (
    entityClass: typeof Model,
    source: RequestWithId,
    idKey: string
    ) => {
      let query = entityClass.query().findById(source[idKey])
      if (entityClass.modifiers['defaultSelects']) {
        query = query.modify('defaultSelects')
      }
      return (await query) as Model
  }

  const buildSetEntity = (
      entityClass: typeof Model,
      idKey: string = 'id',
      optional: boolean = false
      ) => {
    const fn: preHandlerHookHandler = async (request, _reply) => {
      if (!request.entities) {
        request.entities = new Map<typeof Model, Model>()
      }
      const source = getRequestSource(request, idKey)
      if (!source || !source[idKey]) {
        if (optional) {
          return
        }
        const error = fastify.httpErrors.badRequest(
          `You must provide an ID for this ${entityClass.name.toLowerCase()}`
        )
        throw error
      } else {
        const entity = await getRequestEntity(entityClass, source, idKey)
        if (entity) {
          request.entities.set(entityClass, entity)
          return
        }
        const error = fastify.httpErrors.notFound(
          `No ${entityClass.name.toLowerCase()} found with that ID`
        )
        throw error
      }
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
      buildSetEntity(entityClass: typeof Model,
                     idKey?: string,
                     optional?: boolean
                    ): preHandlerHookHandler
    }
  }

  interface FastifyRequest {
    /**
     * A Map of `Model` instances representing the entities specified
     * in this request by their ids.
     */
    entities: Map<typeof Model, Model>
  }
}
