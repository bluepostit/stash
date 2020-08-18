import fastify from 'fastify'
import petsRouter from './routes/pets.router'

const server = fastify()

server.get('/ping', async (_request, _reply) => {
  console.log('ping!')
  return 'pong\n'
})

server.register(petsRouter)

server.listen(4000, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at address ${address}`)
})
