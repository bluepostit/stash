import fastify, { RegisterOptions, FastifyServerOptions } from 'fastify'
import fastifySensible from "fastify-sensible";
import fastifyCookie from 'fastify-cookie'
import fastifyFormbody from 'fastify-formbody'
import session from "fastify-session";
import helmet from 'fastify-helmet'
import AjvErrors from 'ajv-errors';
require('make-promises-safe')

import config from './config'
import { default as db } from "./plugins/objection";
import schema from './plugins/schema'
import auth from './plugins/authentication'
import authRouter from './routes/authentication.router'
import petsRouter from "./routes/pets.router";
import itemsRouter from "./routes/items.router";
import stashesRouter from './routes/stashes.router'


function build(opts: FastifyServerOptions = {}) {
  if (!opts.ajv) {
    opts.ajv = {
      customOptions: {
        $data: true,
        allErrors: true,
        jsonPointers: true
      },
      plugins: [
        AjvErrors
      ]
    }
  }
  const app = fastify(opts)

  // Plugins
  app.register(helmet)
  app.register(fastifySensible)
  app.register(fastifyFormbody)
  app.register(fastifyCookie)
  const sessionOptions: session.Options & RegisterOptions = {
    secret: config.get('COOKIE_SECRET') || '',
    cookieName: '_stash_',
    cookie: { secure: false },
  }
  app.register(session, sessionOptions)
  app.register(db)
  app.register(schema)
  app.register(auth)

  // Routers
  app.register(authRouter)
  app.register(petsRouter)
  app.register(itemsRouter)
  app.register(stashesRouter)

  return app
}

export default build
