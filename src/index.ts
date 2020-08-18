import fastify from 'fastify'
import fastifySensible from 'fastify-sensible'
import config from './config'
import { default as db } from './plugins/objection'
import petsRouter from './routes/pets.router'
import itemsRouter from './routes/items.router'

const server = fastify({ logger: true })

// Plugins
server.register(fastifySensible)
server.register(db)

// Routers
server.register(petsRouter)
server.register(itemsRouter)

const port: number = (() => {
  let port: any = config.get('PORT')
  if (!port) {
    throw new Error("No port is defined!");
  }
  port = parseInt(port, 10)
  return port
})()

server.listen(port, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at address ${address}`)
})

export default server
