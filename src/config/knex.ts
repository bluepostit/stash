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

// Logging
if (config.logging.query) {
  knex.on('query', (data) => {
    console.log('QUERY:', data.sql, data.bindings)
  })
}

if (config.logging.queryError) {
  knex.on('query-error', (data) => {
    console.log(data)
  })
}

if (config.logging.queryResponse) {
  knex.on('query-response', (data) => {
    console.log('QUERY RESPONSE:', data)
  })
}

// Apply this Knex config to all models:
Model.knex(knex)

export { knex as default }
export { config }
