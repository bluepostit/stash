import path from 'path'
import * as dotenv from 'dotenv'
import Knex from 'knex'
import { Model } from 'objection'

import knexConfig from '../config/knexfile'

interface Environment {
  setup(): void
}

const TEST_PATH = path.join(__dirname, '..', '..', '.env.test')

const setupDotenv = (env: string) => {
  if (env === 'test') {
    dotenv.config({ path: TEST_PATH })
  } else {
    dotenv.config()
  }
}

const setupKnexConfig = (env: string) => {
  const config = knexConfig[env]
  const knex = Knex(config)
  Model.knex(knex)
}

const environment: Environment = {
  setup: () => {
    const NODE_ENV: string | undefined = process.env.NODE_ENV
    const env = NODE_ENV || 'development'
    setupDotenv(env)
    setupKnexConfig(env)
  }
}

export default environment
