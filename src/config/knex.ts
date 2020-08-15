import Knex, { ConnectionConfig } from 'knex'
import { Model } from 'objection'

import knexConfig from '../../knexfile'

export let config: {
  connection: ConnectionConfig
}

const getEnv = () => {
  const NODE_ENV: string | undefined = process.env.NODE_ENV
  const env = NODE_ENV || 'development'
  return env
}

const getConfig = (env: string) => {
  const config = knexConfig[env]
  return config
}

const setupKnexConfig = (config: object) => {
  const knex = Knex(config)
  return knex
}

const setupKnexModels = (knex: Knex) => {
  Model.knex(knex)
}

const setup = (config: object) => {
  const knex = setupKnexConfig(config)
  setupKnexModels(knex)
  return knex
}

let env = getEnv()
config = getConfig(env)
const knex = setup(config)

export { knex as default }
