import { FastifyInstance } from 'fastify'
import pino from 'pino'
import build from '../../../src/app'
import { User } from '../../../src/models'

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
    const email = 'auth.test@stash.xyz'
    const password = '123456'

    test("should return an error if no email is given", async () => {
      const res = await app.inject({
        method: "POST",
        url: LOGIN_PATH,
        // headers: { "Content-Type": "application/x-www-form-urlencoded" },
        payload: { password: '123456' },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/username/)
    })

    test("should return an error if no password is given", async () => {
      const res = await app.inject({
        method: "POST",
        url: LOGIN_PATH,
        payload: { username: 'test@test.com' },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/password/)
    })

    test("should return an error if incorrect password is given",
      async () => {
        await app.listen(0)
        await (app.db.User as typeof User)
          .query().
          insert({
            email,
            password
          })
        const res = await app.inject({
          method: "POST",
          url: LOGIN_PATH,
          payload: {
            username: email,
            password: password + 'X'
          },
        })
        expect(res.statusCode).toBe(401)
        expect(res.payload).toMatch(/check your/i)
      })
    test.todo("should return an error if no matching user is found")
    test.todo("should log user in successfully")
  })
})
