import { FastifyInstance } from 'fastify'
import { Item } from '../../src/models'
import RecordManager from '../util/record-manager'
import SessionManager from '../util/session-manager'
// @ts-ignore
import { StatusCode, buildApp, logger } from '../common'
import supertest from 'supertest'

describe('Items', () => {
  let app: FastifyInstance
  const ROOT_PATH = '/items'

  const cleanupDb = async () => {
    await RecordManager.deleteAll()
  }

  beforeAll(async () => {
    await cleanupDb()
    app = buildApp()
    await app.listen(0)
  })

  afterAll(async () => {
    await cleanupDb()
    await app.close()
    await app.db.knex.destroy()
  })

  describe('GET /', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns an error if not signed in', async () => {
      const res = await app.inject({
        method: 'GET',
        url: ROOT_PATH,
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    it('returns an empty list if the user has no items', async () => {
      const user = await RecordManager.createUser()
      const agent = await SessionManager.loginAsUser(app, user)

      // fetch items
      const res = await agent.get(ROOT_PATH)

      expect(res.status).toBe(StatusCode.OK)
      expect(res.body.items).toEqual([])
    })

    it("doesn't return other users' items", async () => {
      await RecordManager.loadFixture('items/items.with-user#1')
      const user = await RecordManager.createUser({ id: 2 })
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(ROOT_PATH)
      expect(res.status).toBe(StatusCode.OK)
      expect(res.body.items).toEqual([])
    })

    it("returns a list of the user's items", async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('items/items.for-user#1')
      const items = await Item.query()
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(ROOT_PATH)
      expect(res.status).toBe(StatusCode.OK)
      const resItems = res.body.items as { [index: string]: any }[]

      expect(resItems).toHaveLength(items.length)
      // Check they have the same ids
      const itemIds = items.map((i) => i.id).sort()
      const resItemIds = resItems.map((i) => i.id).sort()
      expect(itemIds).toEqual(resItemIds)
    })
  })

  describe('GET /:id', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns an error when user is not signed in', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `${ROOT_PATH}/1`,
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    it('returns an error when the item belongs to another user', async () => {
      const user = await RecordManager.createUser({ id: 2 })
      await RecordManager.loadFixture('items/items.with-user#1')
      const items = await Item.query()
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(`${ROOT_PATH}/${items[0].id}`)
      expect(res.status).toBe(StatusCode.FORBIDDEN)
    })

    it('returns an error when the item does not exist', async () => {
      const user = await RecordManager.createUser()
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(`${ROOT_PATH}/1`)
      expect(res.status).toBe(StatusCode.NOT_FOUND)
      expect(res.body.message).toMatch(/found/i)
    })

    it('returns the correct item', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('items/items.for-user#1')
      const items = await Item.query()
      const item = items[0]
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(`${ROOT_PATH}/${item.id}`)
      expect(res.status).toBe(StatusCode.OK)
      expect(res.body).toHaveProperty('item')
      expect(res.body.item).toHaveProperty('id', item.id)
      expect(res.body.item).toHaveProperty('name', item.name)
      expect(res.body.item).toHaveProperty('description', item.description)
    })
  })

  describe('POST /', () => {
    it('returns an error when user is not signed in', async () => {
      await cleanupDb()
      const res = await app.inject({
        method: 'POST',
        url: ROOT_PATH,
        payload: {
          name: 'Acoustic guitar',
          description: 'Emerald green with black leather strap',
        },
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    describe.each`
      name                 | desc                          | expectedStatus | expectedMessage
      ${''}                | ${'Emerald green with strap'} | ${400}         | ${/name/}
      ${'Acoustic guitar'} | ${''}                         | ${400}         | ${/description/}
      ${'Acoustic guitar'} | ${'Emerald green with strap'} | ${201}         | ${''}
    `(
      'creating new Item returns the expected results',
      ({ name, desc, expectedStatus, expectedMessage }) => {
        let agent: supertest.SuperAgentTest
        beforeAll(async () => {
          await cleanupDb()
          const user = await RecordManager.createUser()
          agent = await SessionManager.loginAsUser(app, user)
        })

        test('returns $expectedStatus when given $name, $desc for name and description', async () => {
          const res = await agent.post(ROOT_PATH).send({
            name: name,
            description: desc,
          })
          expect(res.status).toBe(expectedStatus)
          if (expectedStatus != 201) {
            expect(res.body.message).toMatch(expectedMessage)
          } else {
            expect(res.body.item.name).toEqual(name)
            expect(res.body.item.description).toEqual(desc)
          }
        })
      }
    )
  })

  describe('PUT /:id', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns an error if user is not signed in', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `${ROOT_PATH}/1`,
        payload: {
          name: 'Acoustic guitar',
          description: 'Emerald green with black leather strap',
        },
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    it('returns an error if item belongs to another user', async () => {
      const user = await RecordManager.createUser({ id: 2 })
      await RecordManager.loadFixture('items/items.with-user#1')
      const item = await Item.query().first()

      const agent = await SessionManager.loginAsUser(app, user)
      const details = {
        name: 'Acoustic guitar',
        description: 'Emerald green with black leather strap',
      }
      const res = await agent
        .put(`${ROOT_PATH}/${item.id}`)
        .send(details)
      expect(res.status).toBe(StatusCode.FORBIDDEN)
    })

    it('updates item with values from the request', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('items/items.for-user#1')
      const item = await Item.query().first()

      const agent = await SessionManager.loginAsUser(app, user)
      const details = {
        name: 'A very new name after update',
        description: 'A very new description after update',
      }
      const res = await agent
        .put(`${ROOT_PATH}/${item.id}`)
        .send(details)
      expect(res.status).toBe(StatusCode.OK)
    })
  })

  describe('DELETE /:id', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns an error if user is not signed in', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `${ROOT_PATH}/1`,
        payload: {
          name: 'Acoustic guitar',
          description: 'Emerald green with black leather strap',
        },
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    it('returns an error if item belongs to another user', async () => {
      const user = await RecordManager.createUser({ id: 2 })
      await RecordManager.loadFixture('items/items.with-user#1')
      const item = await Item.query().first()

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent
        .delete(`${ROOT_PATH}/${item.id}`)
      expect(res.status).toBe(StatusCode.FORBIDDEN)
    })

    it('deletes the given item', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('items/items.for-user#1')
      const items = await Item.query()

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent
        .delete(`${ROOT_PATH}/${items[0].id}`)
      expect(res.status).toBe(StatusCode.NO_CONTENT)

      const afterItemCount = await Item.query().resultSize()
      expect(afterItemCount).toEqual(items.length - 1)
    })
  })

  describe('DELETE /:id?with_contents=1', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns no error if item has no contents', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      // Has no items with parents
      await RecordManager.loadFixture('items/items.for-user#1')
      const items = await Item.query()
      const item = items[0]

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent
        .delete(`${ROOT_PATH}/${item.id}?with_contents=1`)
      expect(res.status).toBe(StatusCode.NO_CONTENT)

      const newItemsCount = await Item.query().resultSize()
      expect(items.length).toEqual(newItemsCount + 1)
    })

    it('deletes the given item with its children', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('items/item.with-children.for-user#1')

      const items = await Item
        .query()
        .modify('defaultSelects')
        // container first
        .orderBy('id') as Item[]
      const item = items[0]

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent
        .delete(`${ROOT_PATH}/${item.id}?with_contents=1`)
      expect(res.status).toBe(StatusCode.NO_CONTENT)

      const afterItemCount = await Item.query().resultSize()
      expect(afterItemCount).toEqual(items.length - item.children.length - 1)
    })
  })
})
