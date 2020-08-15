import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'

import "core-js/stable";
import "regenerator-runtime/runtime";

import { petsRouter } from './pets/pets.router'
import { errorHandler } from './middleware/errors.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';

dotenv.config()

if (!process.env.PORT) {
  console.log('No PORT environment variable found!')
  process.exit(1)
}

const PORT: number = parseInt(process.env.PORT, 10)

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/pets', petsRouter)

app.use(errorHandler)
app.use(notFoundHandler)

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`)
})
