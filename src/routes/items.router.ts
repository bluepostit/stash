import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { Item, Stash, User } from '../models'
import StatusCode from '../common/http-status-code'

interface CreateItemBody {
  name: string
  description: string
  stash_id?: number
}

type DeleteItemQuery = {
  with_contents?: string
}

const createItemSchema = {
  body: { $ref: 'createItem#body' },
  response: {
    '2xx': {
      $ref: 'createItem#response',
    },
  },
}

const deleteItemSchema = {
  querystring: {
    type: 'object',
    properties: {
      withContents: {
        type: 'string',
        enum: [ '1' ]
      }
    }
  }
}

const plugin: FastifyPluginCallback = async (fastify, _options, done) => {
  const ROOT_PATH = '/items'
  // Returns a preHandler function
  const setItem = fastify.db.buildSetEntity(Item)
  const setStash = fastify.db.buildSetEntity(Stash, 'stash_id', true)

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
        setItem,
        fastify.auth.authorizeEntities,
      ],
    },
    async (request, _reply) => {
      return {
        item: request.entities.get(Item),
      }
    }
  )

  fastify.delete(
    `${ROOT_PATH}/:id`,
    {
      preHandler: [
        fastify.auth.mustBeSignedIn,
        setItem,
        fastify.auth.authorizeEntities,
      ],
      schema: deleteItemSchema,
    },
    async (request, reply) => {
      const item = request.entities.get(Item) as Item
      const query = request.query as DeleteItemQuery
      if (query.with_contents && query.with_contents === '1') {
        await item
          .$relatedQuery('children')
          .delete()
      }
      await item
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
      preHandler: [
        fastify.auth.mustBeSignedIn,
        setStash,
        fastify.auth.authorizeEntities,
      ],
      schema: createItemSchema,
    },
    async (request, reply) => {
      const { name, description, stash_id } = request.body
      const data = {
        name,
        description,
        stash_id
      }
      const item = await request.session.user
        .$relatedQuery('items')
        .insert(data)
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
        setItem,
        fastify.auth.authorizeEntities,
      ],
      schema: createItemSchema,
    },
    async (request, reply) => {
      const { name, description } = request.body
      const item = request.entities.get(Item) as Item
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
