import path from 'path'
import { ConnectionConfig } from 'knex'
import config from './src/config/'

interface Config {
  [index: string]: {
    connection: ConnectionConfig,
    [index: string]: any
  }
}

const buildConfig = (name: string) => {
  return {
    client: 'postgresql',
    connection: {
      database: config.get('DB_NAME') || '',
      host: config.get('DB_HOST') || '',
      user: config.get('DB_USER') || '',
      password: config.get('DB_PASSWORD') || '',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(
        __dirname, 'src/db/migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(
        __dirname, `src/db/seeds/${name}`)
    },
    logging: {
      query: config.get('QUERY_LOG') || null,
      queryError: config.get('QUERY_ERROR_LOG') || null,
      queryResponse: config.get('QUERY_RESPONSE_LOG') || null
    }
  }
}

const knexConfig: Config = {
  development: buildConfig('development'),
  test: buildConfig('test')
}

export default knexConfig
module.exports = knexConfig
