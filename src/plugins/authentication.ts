import { FastifyPlugin, preHandlerHookHandler } from 'fastify'
import fp from 'fastify-plugin'
import { User, BelongsToUser } from '../models'

const plugin: FastifyPlugin = (fastify, _options, done) => {
  const mustBeSignedIn: preHandlerHookHandler = (request, _reply, done) => {
    if (!request.session.user) {
      const error = fastify.httpErrors.unauthorized('You must sign in first')
      done(error)
    }
    done()
  }

  const authorizeEntity: preHandlerHookHandler = (request, _reply, done) => {
    const entity = (request.entity as unknown) as BelongsToUser
    if (!entity) {
      done(fastify.httpErrors.badRequest('No entity given'))
    }
    if (request.session.user) {
      const user = (request.session.user as User)
      if (user.id !== entity.user_id) {
        fastify.log.info(`user ID: ${user.id} != entity's user ID: ${entity.user_id}`)
        done(fastify.httpErrors.forbidden(
          'This entity does not belong to you'
        ))
      }
    }
  }

  fastify.decorate('auth', {
    mustBeSignedIn,
    authorizeEntity
  })

  done()
}

declare module 'fastify' {
  interface FastifyInstance {
    auth: {
      authorizeEntity: preHandlerHookHandler,
      mustBeSignedIn: preHandlerHookHandler
    }
  }
}

export default fp(plugin)
