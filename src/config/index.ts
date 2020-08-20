import environment from './environment'

environment.setup()

const envKeys = [
  'COOKIE_SECRET',
  'DB_HOST',
  'DB_NAME',
  'DB_PASSWORD',
  'DB_USER',
  'LEVEL',
  'NODE_ENV',
  'PORT',
]
const config = new Map<string, string>()
for (let key of envKeys) {
  if (process.env[key]) {
    config.set(key, (process.env[key] as string))
  }
}

export default config
