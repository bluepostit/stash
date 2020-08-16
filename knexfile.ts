import path from 'path'
import { ConnectionConfig } from 'knex'
import './src/config/environment'

const env = process.env

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
      database: env.DB_NAME || '',
      host: env.DB_HOST || '',
      user: env.DB_USER || '',
      password: env.DB_PASSWORD || '',
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
    }
  }
}

const config: Config = {
  development: buildConfig('development'),
  test: buildConfig('test')
}

export default config
module.exports = config