import fastify, { RegisterOptions } from 'fastify'
import fastifySensible from "fastify-sensible";
import fastifyCookie from 'fastify-cookie'
import fastifyFormbody from 'fastify-formbody'
import session from "fastify-session";
import helmet from 'fastify-helmet'
require('make-promises-safe')

import config from './config'
import { default as db } from "./plugins/objection";
import authRouter from './routes/authentication.router'
import petsRouter from "./routes/pets.router";
import itemsRouter from "./routes/items.router";

function build(opts = {}) {
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

  // Routers
  app.register(authRouter)
  app.register(petsRouter)
  app.register(itemsRouter)

  return app
}

export default build
