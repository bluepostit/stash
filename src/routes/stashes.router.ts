import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { Stash, User } from '../models'
import StatusCode from '../common/http-status-code'

interface CreateStashBody {
  name: string
  address: string
  notes: string
}

const createStashSchema = {
  body: { $ref: 'createStash' },
  response: {
    '2xx': {
      $ref: 'createStash#response',
    },
  },
}

type DeleteStashQuery = {
  with_contents?: string
}

const deleteStashSchema = {
  querystring: { $ref: 'deleteStash' }
}

const plugin: FastifyPluginCallback = async (fastify, _options, done) => {
  const ROOT_PATH = '/stashes'
  // Returns a preHandler function
  const setEntity = fastify.db.buildSetEntity(Stash)

  fastify.get(
    ROOT_PATH,
    {
      preHandler: fastify.auth.mustBeSignedIn,
    },
    async (request, _reply) => {
      const user = request.session.user as User
      const stashes = await user
        .$relatedQuery('stashes')
        .modify('defaultSelects')
      return { stashes }
    }
  )

  fastify.get(
    `${ROOT_PATH}/:id`,
    {
      preHandler: [
        fastify.auth.mustBeSignedIn,
        setEntity,
        fastify.auth.authorizeEntities
      ]
    },
    async (request, _reply) => {
      return {
        stash: request.entities.get(Stash)
      }
    }
  )

  fastify.post<{ Body: CreateStashBody }>(
    ROOT_PATH,
    {
      preHandler: [fastify.auth.mustBeSignedIn],
      schema: createStashSchema,
    },
    async (request, reply) => {
      const { name, address, notes } = request.body
      const stash = await request.session.user
        .$relatedQuery('stashes')
        .insert({
          name,
          address,
          notes
        })
        .modify('defaultSelects')
      reply.code(StatusCode.CREATED)
      reply.send({
        stash,
      })
    }
  )

  fastify.delete(
    `${ROOT_PATH}/:id`,
    {
      preHandler: [
        fastify.auth.mustBeSignedIn,
        setEntity,
        fastify.auth.authorizeEntities,
      ],
      schema: deleteStashSchema,
    },
    async (request, reply) => {
      request.log.info('hit delete request')
      const stash = request.entities.get(Stash) as Stash
      const query = request.query as DeleteStashQuery
      if (query.with_contents && query.with_contents === '1') {
        await stash.$relatedQuery('items').delete()
      }
      const res = await stash.$query().delete()
      fastify.log.info(res.toString())
      reply.code(StatusCode.NO_CONTENT)
      reply.send()
    }
  )

  done()
}

export default fp(plugin)
