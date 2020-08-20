import { FastifyPlugin, preHandlerHookHandler } from 'fastify'
import fp from 'fastify-plugin'

const plugin: FastifyPlugin = (fastify, _options, done) => {
  const mustBeSignedIn: preHandlerHookHandler = (request, _reply, done) => {
    if (!request.session.user) {
      const error = fastify.httpErrors.unauthorized('You must sign in first')
      done(error)
    }
    done()
  }

  fastify.decorate('auth', {
    mustBeSignedIn,
  })

  done()
}

declare module 'fastify' {
  interface FastifyInstance {
    auth: {
      mustBeSignedIn: preHandlerHookHandler
    }
  }
}

export default fp(plugin)
