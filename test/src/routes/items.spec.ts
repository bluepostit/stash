import { FastifyInstance } from 'fastify'
import build from '../../../src/app'
import { Item, User } from '../../../src/models'
import RecordManager from '../../util/record-manager'
import SessionManager from '../../util/session-manager'
// @ts-ignore
import { StatusCode, logger } from '../../common'

describe('Items', () => {
  let app: FastifyInstance
  const ROOT_PATH = '/items'

  const cleanupDb = async () => {
    await Item.query().delete()
    await User.query().delete()
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
        url: ROOT_PATH,
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    test('returns an empty list if the user has no items', async () => {
      const user = await RecordManager.createUser()
      const agent = await SessionManager.loginAsUser(app, user)

      // fetch items
      const res = await agent.get(ROOT_PATH)

      expect(res.status).toBe(StatusCode.OK)
      expect(res.body.items).toEqual([])
    })

    test("doesn't return other users' items", async () => {
      await RecordManager.loadFixture('items.with-user#1', 'routes')
      const user = await RecordManager.createUser({ id: 2 })
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(ROOT_PATH)
      expect(res.status).toBe(StatusCode.OK)
      expect(res.body.items).toEqual([])
    })

    test("returns a list of the user's items", async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('items.for-user#1.no-user-insert', 'routes')
      const items = await Item.query()
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(ROOT_PATH)
      expect(res.status).toBe(StatusCode.OK)
      const resItems = (res.body.items as { [index: string]: any }[])
      logger.info(resItems)
      expect(resItems).toHaveLength(items.length)
      // Check they have the same ids
      const itemIds = items.map(i => i.id).sort()
      const resItemIds = resItems.map(i => i.id).sort()
      expect(itemIds).toEqual(resItemIds)
    })
  })
})
