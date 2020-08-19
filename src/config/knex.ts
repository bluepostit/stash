import Knex from 'knex'
import { Model } from 'objection'

import { default as configData } from '../../knexfile'

const getEnv = () => {
  const env: string = process.env.NODE_ENV || 'development'
  return env
}

let env = getEnv()
let config = configData[env]
const knex = Knex(config)

// Apply this Knex config to all models:
Model.knex(knex)

export { knex as default }
export { config }
