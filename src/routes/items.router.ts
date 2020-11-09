import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { Item, User } from '../models'
import StatusCode from '../common/http-status-code'

interface CreateItemBody {
  name: string
  description: string
}

const createItemSchema = {
  body: { $ref: 'createItem#body' },
  response: {
    '2xx': {
      $ref: 'createItem#response',
    },
  },
}

const plugin: FastifyPluginCallback = async (fastify, _options, done) => {
  const ROOT_PATH = '/items'
  // Returns a preHandler function
  const setEntity = fastify.db.buildSetEntity(Item)

  fastify.get(
    ROOT_PATH,
    {
      preHandler: fastify.auth.mustBeSignedIn,
    },
    async (request, _reply) => {
      const user = request.session.user as User
      const items = await user.$relatedQuery('items').modify('defaultSelects')
      return {
        items,
      }
    }
  )

  fastify.get(
    `${ROOT_PATH}/:id`,
    {
      preHandler: [
        fastify.auth.mustBeSignedIn,
        setEntity,
        fastify.auth.authorizeEntity,
      ],
    },
    async (request, _reply) => {
      return {
        item: request.entity,
      }
    }
  )

  fastify.delete(
    `${ROOT_PATH}/:id`,
    {
      preHandler: [
        fastify.auth.mustBeSignedIn,
        setEntity,
        fastify.auth.authorizeEntity,
      ],
    },
    async (request, reply) => {
      await (request.entity as Item)
        .$query()
        .delete()
      reply.code(StatusCode.NO_CONTENT)
      reply.send()
    }
  )


  fastify.post<{
    Body: CreateItemBody
  }>(
    ROOT_PATH,
    {
      preHandler: [fastify.auth.mustBeSignedIn],
      schema: createItemSchema,
    },
    async (request, reply) => {
      const { name, description } = request.body
      const item = await request.session.user
        .$relatedQuery('items')
        .insert({
          name,
          description,
        })
        .modify('defaultSelects')
      reply.code(StatusCode.CREATED)
      reply.send({
        item,
      })
    }
  )

  fastify.put<{
    Body: CreateItemBody
  }>(
    `${ROOT_PATH}/:id`,
    {
      preHandler: [
        fastify.auth.mustBeSignedIn,
        setEntity,
        fastify.auth.authorizeEntity,
      ],
      schema: createItemSchema,
    },
    async (request, reply) => {
      const { name, description } = request.body
      const item = request.entity as Item
      await item.$query().update({
        name,
        description,
      })
      reply.send({
        item,
      })
    }
  )

  done()
}

export default fp(plugin)
