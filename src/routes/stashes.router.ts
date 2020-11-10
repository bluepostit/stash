import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import { Stash } from '../models'
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

const plugin: FastifyPluginCallback = async (fastify, _options, done) => {
  const ROOT_PATH = '/stashes'
  // Returns a preHandler function
  // const setEntity = fastify.db.buildSetEntity(Stash)

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

  done()
}

export default fp(plugin)
