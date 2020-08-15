import Knex from 'knex'
import { Model } from 'objection'

import knexConfig from '../../knexfile'

const setupKnexConfig = (env: string) => {
  const config = knexConfig[env]
  const knex = Knex(config)
  Model.knex(knex)
}

const setup = () => {
  const NODE_ENV: string | undefined = process.env.NODE_ENV
  const env = NODE_ENV || 'development'
  setupKnexConfig(env)
}

setup()
