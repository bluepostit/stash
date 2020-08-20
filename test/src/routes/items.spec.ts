import { FastifyInstance } from 'fastify'
import supertest from 'supertest'
import build from '../../../src/app'
import { Item, User } from '../../../src/models'
import { insertUser, StatusCode } from '../../common'
// @ts-ignore
import debug from '../../util/debug'

describe('Items', () => {
  let app: FastifyInstance
  const ROOT_PATH = '/items'
  const LOGIN_PATH = '/login'
  const USER_CREDS = {
    username: 'items.test@stash.xyz',
    password: '123456'
  }

  const cleanupDb = async () => {
    await Item.query().delete()
    await User.query().delete()
  }

  const insertDbUser = async () => {
    return await insertUser(
      USER_CREDS.username,
      USER_CREDS.password
    )
  }

  beforeEach(async () => {
    app = build({ logger: { level: 'error' } })
    await app.listen(0)
    cleanupDb()
  })

  afterEach(async () => {
    cleanupDb()
    await app.close()
  })

  afterAll(async () => {
    await app.db.knex.destroy()
  })

  describe('GET /', () => {
    test('returns an error if not signed in', async () => {
      const res = await app.inject({
        method: 'GET',
        url: ROOT_PATH
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    test('returns an empty list if the user has no items', async () => {
      await insertDbUser()
      const agent = supertest.agent(app.server)
      let res = await agent.post(LOGIN_PATH).send(USER_CREDS)
      expect(res.body.message).toMatch(/success/i)

      // fetch items
      res = await agent.get(ROOT_PATH)

      expect(res.status).toBe(StatusCode.OK)
      expect(res.body.items).toEqual([])
    })

    test.todo("doesn't return other users' items")

    test.todo("returns a list of the user's items")
  })
})
