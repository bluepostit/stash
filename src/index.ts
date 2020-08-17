import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

// Needed for Babel:
import "core-js/stable"
import "regenerator-runtime/runtime"

import './config/environment'
import './config/knex'
import './config/authentication'

import { petsRouter } from './pets/pets.router'
import sessionsRouter from './controllers/authorization/sessions'
import { errorHandler } from './middleware/errors.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';

if (!process.env.PORT) {
  console.log('No PORT environment variable found!')
  process.exit(1)
}
const PORT: number = parseInt(process.env.PORT, 10)

const app = express()

if (process.env.LOGGING) {
  app.use(morgan(process.env.LOGGING))
}

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/pets', petsRouter)
app.use('/sessions', sessionsRouter)

app.use(errorHandler)
app.use(notFoundHandler)

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`)
})

export default app
