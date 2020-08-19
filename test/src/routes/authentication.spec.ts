import { FastifyInstance } from 'fastify'
import pino from 'pino'
import build from '../../../src/app'
import { User } from '../../../src/models'

describe('Authentication', () => {
  let app: FastifyInstance
  const LOGIN_PATH = '/login'
  // @ts-ignore
  const logger = pino({
    prettyPrint: { colorize: true },
  })

  const cleanupDb = async () => {
    await app.db.User.query().delete()
  }

  beforeEach(async () => {
    app = build()
    await app.listen(0)
    cleanupDb()
  })
  afterEach(async () => {
    app.close()
    cleanupDb()
  })

  describe('Login', () => {
    const email = 'auth.test@stash.xyz'
    const password = '123456'

    test('returns an error if no email is given', async () => {
      const res = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        // headers: { "Content-Type": "application/x-www-form-urlencoded" },
        payload: { password: '123456' },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/username/)
    })

    test('returns an error if no password is given', async () => {
      const res = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: { username: 'test@test.com' },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/password/)
    })

    test('returns an error if incorrect password is given', async () => {
      await (app.db.User as typeof User).query().insert({
        email,
        password,
      })
      const res = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          username: email,
          password: password + 'X',
        },
      })
      expect(res.statusCode).toBe(401)
      expect(res.payload).toMatch(/check your/i)
    })

    test('returns an error if no matching user is found', async () => {
      const res = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          username: email,
          password: password,
        },
      })
      expect(res.statusCode).toBe(401)
      expect(res.payload).toMatch(/check your/i)
    })

    test('logs user in successfully', async () => {
      await(app.db.User as typeof User)
        .query()
        .insert({
          email,
          password,
        })
      const res = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          username: email,
          password
        },
      })
      expect(res.statusCode).toBe(200)
      expect(res.body).toMatch(/success/i)
    })

    test.todo('tells user if they are logged in already')
  })
})
