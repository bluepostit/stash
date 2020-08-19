import path from 'path'
import * as dotenv from 'dotenv'

interface Environment {
  setup(): void
}

const TEST_PATH = path.join(__dirname, '..', '..', '.env.test')

const setupDotenv = (env: string) => {
  if (env === 'test') {
    dotenv.config({ path: TEST_PATH })
  } else {
    dotenv.config()
  }
}

const environment: Environment = {
  setup: () => {
    const NODE_ENV: string | undefined = process.env.NODE_ENV
    const env = NODE_ENV || 'development'
    setupDotenv(env)
  }
}

export default environment
