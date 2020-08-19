import environment from './environment'

environment.setup()

const envKeys = [
  'NODE_ENV',
  'PORT',
  'DB_NAME',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
]
const config = new Map<string, string>()
for (let key of envKeys) {
  if (process.env[key]) {
    config.set(key, (process.env[key] as string))
  }
}

export default config
