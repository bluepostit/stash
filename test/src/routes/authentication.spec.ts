import { FastifyInstance } from 'fastify'
import build from '../../../src/app'
import pino from 'pino'

describe("Authentication", () => {
  let app: FastifyInstance
  const LOGIN_PATH = '/login'
  const logger = pino({
    prettyPrint: { colorize: true }
  })

  beforeEach(() => {
    app = build()
  })
  afterEach(() => {
    app.close()
  })
  describe("Login", () => {
    test("should return an error if no email is given", async () => {
      const res = await app.inject({
        method: "POST",
        url: LOGIN_PATH,
        // headers: { "Content-Type": "application/x-www-form-urlencoded" },
        payload: {
          password: '123456'
        },
      })
      logger.info(res.payload)
      expect(res.statusCode).toBe(200)
    })

    test.todo("should return an error if no password is given")
    test.todo("should return an error if incorrect password is given")
    test.todo("should return an error if no matching user is found")
    test.todo("should log user in successfully")
  })
})
