import Knex, { ConnectionConfig } from 'knex'
import { Model } from 'objection'

import { default as configData } from '../../knexfile'

let config: {
  connection: ConnectionConfig
}

const getEnv = () => {
  const env: string = process.env.NODE_ENV || 'development'
  return env
}

const setup = (config: object) => {
  const knex = Knex(config)
  Model.knex(knex)
  return knex
}

let env = getEnv()
config = configData[env]
const knex = setup(config)

export { knex as default }
export { config }
