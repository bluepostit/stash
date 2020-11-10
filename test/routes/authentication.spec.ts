import { FastifyInstance } from 'fastify'
import supertest from 'supertest'
import { User } from '../../src/models'
import RecordManager from '../util/record-manager'
// @ts-ignore
import debug from '../../util/debug'
import { buildApp } from '../common'

describe('Authentication', () => {
  let app: FastifyInstance
  const LOGIN_PATH = '/login'
  const LOGOUT_PATH = '/logout'
  const SIGN_UP_PATH = '/sign-up'

  const TEST_EMAIL = 'auth.test@stash.xyz'
  const TEST_PASSWORD = '123456'

  const cleanupDb = async () => {
    await RecordManager.deleteAll()
  }

  const insertUser = async (email: string | null, password: string | null) => {
    // @ts-ignore
    return await User.query().insert({ email, password })
  }

  beforeAll(async () => {
    app = buildApp()
    await app.listen(0)
  })

  beforeEach(async () => {
    await cleanupDb()
  })

  afterAll(async () => {
    await app.close()
    await app.db.knex.destroy()
  })

  describe('Login', () => {
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
      await insertUser(TEST_EMAIL, TEST_PASSWORD)
      const res = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          username: TEST_EMAIL,
          password: TEST_PASSWORD + 'X',
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
          username: TEST_EMAIL,
          password: TEST_PASSWORD,
        },
      })
      expect(res.statusCode).toBe(401)
      expect(res.payload).toMatch(/check your/i)
    })

    test('logs user in successfully', async () => {
      await insertUser(TEST_EMAIL, TEST_PASSWORD)
      const res = await app.inject({
        method: 'POST',
        url: LOGIN_PATH,
        payload: {
          username: TEST_EMAIL,
          password: TEST_PASSWORD,
        },
      })
      expect(res.statusCode).toBe(200)
      expect(res.body).toMatch(/success/i)
    })

    test('tells user if they are logged in already', async () => {
      await insertUser(TEST_EMAIL, TEST_PASSWORD)
      const agent = supertest.agent(app.server)
      let res = await agent.post(LOGIN_PATH).send({
        username: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
      expect(res.body.message).toMatch(/success/i)
      expect(res.header['set-cookie'].length).toBeGreaterThan(0)

      res = await agent.post(LOGIN_PATH).send({
        username: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
      expect(res.status).toBe(200)
      expect(res.body.message).toMatch(/already/i)
    })
  })

  describe('Logout', () => {
    test('successfully logs user out', async () => {
      await insertUser(TEST_EMAIL, TEST_PASSWORD)
      const agent = supertest.agent(app.server)
      let res = await agent.post(LOGIN_PATH).send({
        username: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
      expect(res.body.message).toMatch(/success/i)
      expect(res.header['set-cookie'].length).toBeGreaterThan(0)

      res = await agent.get(LOGOUT_PATH)
      expect(res.status).toBe(200)
      expect(res.body.message).toMatch(/success/i)
    })
  })

  describe('Sign-up', () => {
    test('returns an error if no user-name is given', async () => {
      const res = await app.inject({
        method: 'POST',
        url: SIGN_UP_PATH,
        payload: {
          password: TEST_PASSWORD,
          password2: TEST_PASSWORD,
        },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/username/)
    })

    test('returns an error if no password is given', async () => {
      const res = await app.inject({
        method: 'POST',
        url: SIGN_UP_PATH,
        payload: {
          username: TEST_EMAIL,
          password2: TEST_PASSWORD,
        },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/password/)
    })

    test('returns an error if the password is not repeated', async () => {
      const res = await app.inject({
        method: 'POST',
        url: SIGN_UP_PATH,
        payload: {
          username: TEST_EMAIL,
          password: TEST_PASSWORD,
        },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/password/)
    })

    test("returns an error if the passwords don't match", async () => {
      const res = await app.inject({
        method: 'POST',
        url: SIGN_UP_PATH,
        payload: {
          username: TEST_EMAIL,
          password: TEST_PASSWORD,
          password2: TEST_PASSWORD + ' ',
        },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/match/)
    })

    test('returns an error if the email has incorrect format', async () => {
      const res = await app.inject({
        method: 'POST',
        url: SIGN_UP_PATH,
        payload: {
          username: 'not.an.email@',
          password: TEST_PASSWORD,
          password2: TEST_PASSWORD,
        },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/email/)
    })

    test('returns an error if the password is too short', async () => {
      const res = await app.inject({
        method: 'POST',
        url: SIGN_UP_PATH,
        payload: {
          username: TEST_EMAIL,
          password: 'short',
          password2: 'short',
        },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/password.*short/i)
    })

    test('returns an error if a user already exists with that email', async () => {
      await insertUser(TEST_EMAIL, TEST_PASSWORD)

      const res = await app.inject({
        method: 'POST',
        url: SIGN_UP_PATH,
        payload: {
          username: TEST_EMAIL,
          password: TEST_PASSWORD,
          password2: TEST_PASSWORD,
        },
      })
      expect(res.statusCode).toBe(400)
      expect(res.payload).toMatch(/exists/i)
    })

    test('creates a user with the given credentials', async () => {
      const res = await app.inject({
        method: 'POST',
        url: SIGN_UP_PATH,
        payload: {
          username: TEST_EMAIL,
          password: TEST_PASSWORD,
          password2: TEST_PASSWORD,
        },
      })
      expect(res.statusCode).toBe(200)
      expect(res.payload).toMatch(/success/i)

      const user = await User.query().first()
      expect(user.email).toBe(TEST_EMAIL)
    })
  })
})
