import { FastifyInstance } from 'fastify'
// import LightMyRequest from 'light-my-request'
import pino from 'pino'
import supertest from 'supertest'
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
    await User.query().delete()
  }

  const insertUser = async (email: string | null, password: string | null) => {
    // @ts-ignore
    return await User.query().insert({ email, password })
  }

  beforeEach(async () => {
    app = build()
    await app.listen(0)
    cleanupDb()
  })

  afterEach(async () => {
    cleanupDb()
    app.close()
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
      await insertUser(email, password)
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
      await insertUser(email, password)
      const res = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          username: email,
          password,
        },
      })
      expect(res.statusCode).toBe(200)
      expect(res.body).toMatch(/success/i)
    })

    test('tells user if they are logged in already', async () => {
      await insertUser(email, password)
      const agent = supertest.agent(app.server)
      const res = await agent.post(LOGIN_PATH)
        .send({
          username: email,
          password,
        })
        .expect(/success/i)
        .expect('set-cookie', /stash/)

      await agent.post(LOGIN_PATH)
        .send({
          username: email,
          password,
        })
        .expect(200)
        .expect(/already/i)
    })
  })
})
