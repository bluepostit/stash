import { FastifyPluginCallback, preHandlerHookHandler } from 'fastify'
import fp from 'fastify-plugin'
import { User, BelongsToUser } from '../models'

const plugin: FastifyPluginCallback = (fastify, _options, done) => {
  const mustBeSignedIn: preHandlerHookHandler = (request, _reply, done) => {
    if (!request.session.user) {
      const error = fastify.httpErrors.unauthorized('You must sign in first')
      done(error)
    }
    done()
  }

  const authorizeEntities: preHandlerHookHandler = (request, _reply, done) => {
    if (request.entities.size === 0) {
      done()
    }

    if (request.session.user) {
      const user = (request.session.user as User)
      request.entities.forEach((entity: unknown) => {
        const entityObj = entity as BelongsToUser
        const entityType = entityObj.constructor.name.toLowerCase()
        // console.log(entityObj)
        if (!entityObj.user || user.id !== entityObj.user.id) {
          fastify.log.info(
            `user ID: ${user.id} != ${entityType}'s user ID: `
            + `${(entityObj.user as User).id}`)
          done(fastify.httpErrors.forbidden(
            `This ${entityType} does not belong to you`
          ))
        }
      })
      done()
    }
  }

  fastify.decorate('auth', {
    mustBeSignedIn,
    authorizeEntities
  })

  done()
}

declare module 'fastify' {
  interface FastifyInstance {
    auth: {
      authorizeEntities: preHandlerHookHandler,
      mustBeSignedIn: preHandlerHookHandler
    }
  }
}

export default fp(plugin)
