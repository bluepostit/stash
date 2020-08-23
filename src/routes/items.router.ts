import { FastifyPlugin, FastifySchema } from 'fastify'
import fp from 'fastify-plugin'
import { Item, User } from '../models'

interface CreateItemBody {
  name: string
  description: string
}

const createItemSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['name', 'description'],
    properties: {
      name: {
        type: 'string',
        minLength: 6
      },
      description: {
        type: 'string',
        minLength: 6
      },
    },
  },
}

const plugin: FastifyPlugin = async (fastify, _options, done) => {
  const ROOT_PATH = '/items'
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

  // Returns a preHandler function
  const setEntity = fastify.db.buildSetEntity(Item)

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

  fastify.post<{ Body: CreateItemBody }>(
    ROOT_PATH,
    {
      preHandler: [
        fastify.auth.mustBeSignedIn
      ],
      schema: createItemSchema
    },
    async (request, _reply) => {
      const { name, description } = request.body
      const item = await request.session.user
        .$relatedQuery('items')
        .insert({
          name,
          description,
        })
        .modify('defaultSelects')
      return { item }
    }
  )

  done()
}

export default fp(plugin)
