import fastify from 'fastify'
import fastifySensible from "fastify-sensible";
import { default as db } from "./plugins/objection";
import authRouter from './routes/authentication.router'
import petsRouter from "./routes/pets.router";
import itemsRouter from "./routes/items.router";

function build(opts = {}) {
  const app = fastify(opts)

  // Plugins
  app.register(fastifySensible)
  app.register(db)

  // Routers
  app.register(authRouter)
  app.register(petsRouter)
  app.register(itemsRouter)

  return app
}

export default build
