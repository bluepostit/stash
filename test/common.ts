import pino from 'pino'
import pinoDebug from 'pino-debug'
import { User } from '../src/models/'
import config from '../src/config'
import build from '../src/app'

export const insertUser = async (email: string | null, password: string | null) => {
  // @ts-ignore
  return await User.query().insert({ email, password })
}

export const enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export const logger = pino({
  level: config.get('LEVEL') || 'info',
  prettyPrint: true
})
pinoDebug(logger, {
  auto: true,
  map: {
    'stash:*': 'debug',
    // 'fastify:*': 'debug',
    // '*': 'trace'
  }
})

export const buildApp = () => {
  return build({
      logger: {
        level: 'warn',
        // @ts-ignore
        file: '/tmp/stash-test.log',
        prettyPrint: true
      }
    })
}
