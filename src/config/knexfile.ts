import path from 'path'

const env = process.env

interface KnexConfig {
  [index: string]: object
}

interface ConfigCreator {
  (name: string): object
}

const defaultConfig = {
  client: 'postgresql',
  connection: {
    database: env.DB_NAME,
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: '',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: path.join(__dirname, '..', 'db/seeds')
  }
}

let createConfig: ConfigCreator
createConfig = (name) => {
  let config = defaultConfig

  config.migrations.directory = path.join(
    __dirname, '..', `db/migrations/${name}`)
  config.seeds.directory = path.join(
    __dirname, '..', `db/seeds/${name}`)

  return config
}

const config: KnexConfig = {
  development: createConfig('development'),
  test: createConfig('test')
}

export default config
