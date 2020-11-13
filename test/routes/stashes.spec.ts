import { FastifyInstance } from 'fastify'
import { Item, Stash } from '../../src/models'
import RecordManager from '../util/record-manager'
import SessionManager from '../util/session-manager'
// @ts-ignore
import { StatusCode, buildApp, logger } from '../common'
import supertest from 'supertest'

describe('Stashes', () => {
  let app: FastifyInstance
  const ROOT_PATH = '/stashes'

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

  describe('POST /', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns an error if not signed in', async () => {
      const res = await app.inject({
        method: 'POST',
        url: ROOT_PATH,
        payload: {
          name: "Jenny's house",
          address: '21 Main Avenue, Springfield',
          notes: "Call Jenny first to let her know you're coming over",
        },
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    describe.each`
      name              | address                       | expectedStatus | expectedMessage
      ${''}             | ${'12 Main Ave, Springfield'} | ${400}         | ${/name/}
      ${"Jenny's flat"} | ${''}                         | ${400}         | ${/address/}
      ${"Jenny's flat"} | ${'abcd'}                     | ${400}         | ${/address/}
      ${"Jenny's flat"} | ${'12 Main Ave, Springfield'} | ${201}         | ${''}
    `(
      'creating new Stash returns the expected results',
      ({ name, address, expectedStatus, expectedMessage }) => {
        let agent: supertest.SuperAgentTest
        beforeEach(async () => {
          await cleanupDb()
          const user = await RecordManager.createUser()
          agent = await SessionManager.loginAsUser(app, user)
        })

        test(`returns ${expectedStatus} when given '${name}', '${address}' for name and address`, async () => {
          const res = await agent.post(ROOT_PATH).send({
            name: name,
            address: address,
          })
          expect(res.status).toBe(expectedStatus)
          if (expectedStatus != 201) {
            expect(res.body.message).toMatch(expectedMessage)
          } else {
            expect(res.body.stash.name).toEqual(name)
            expect(res.body.stash.address).toEqual(address)
          }
        })
      }
    )
  })

  describe('DELETE /:id', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns an error if user is not signed in', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `${ROOT_PATH}/1`,
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    it('returns an error if stash belongs to another user', async () => {
      const user = await RecordManager.createUser({ id: 2 })
      await RecordManager.loadFixture('stashes/stashes.with-user#1')
      const stash = await Stash.query().first()

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent.delete(`${ROOT_PATH}/${stash.id}`)
      expect(res.status).toBe(StatusCode.FORBIDDEN)
    })

    it('deletes the given stash', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('stashes/stashes.for-user#1')
      const stashes = await Stash.query()

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent.delete(`${ROOT_PATH}/${stashes[0].id}`)
      expect(res.status).toBe(StatusCode.NO_CONTENT)

      const afterItemCount = await Stash.query().resultSize()
      expect(afterItemCount).toEqual(stashes.length - 1)
    })

    it('deletes the stash, but not its items', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('stashes/stash.with-items.for-user#1')

      const stash = (await Stash.query().select('id').first()) as Stash
      const itemCountBefore = await Item.query().resultSize()

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent.delete(`${ROOT_PATH}/${stash.id}`)
      expect(res.status).toBe(StatusCode.NO_CONTENT)

      const stashCount = await Stash.query().resultSize()
      expect(stashCount).toEqual(0)

      const itemCountAfter = await Item.query().resultSize()
      expect(itemCountBefore).toEqual(itemCountAfter)
    })
  })

  describe('DELETE /:id?with_contents=1', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns no error if stash has no items', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      // Has no stashes with items
      await RecordManager.loadFixture('stashes/stashes.for-user#1')
      const stashes = await Stash.query()
      const stash = stashes[0]

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent.delete(`${ROOT_PATH}/${stash.id}?with_contents=1`)
      expect(res.status).toBe(StatusCode.NO_CONTENT)

      const newStashesCount = await Stash.query().resultSize()
      expect(stashes.length).toEqual(newStashesCount + 1)
    })

    it('deletes the given stash with its items', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('stashes/stash.with-items.for-user#1')

      const stashes = (await Stash.query()
        .modify('defaultSelects')
        .orderBy('id')) as Stash[]
      const stash = stashes[0]

      const agent = await SessionManager.loginAsUser(app, user)
      const res = await agent.delete(`${ROOT_PATH}/${stash.id}?with_contents=1`)
      expect(res.status).toBe(StatusCode.NO_CONTENT)

      const stashCount = await Stash.query().resultSize()
      expect(stashCount).toEqual(stashes.length - 1)

      const itemCount = await Item.query().resultSize()
      expect(itemCount).toEqual(0)
    })
  })

  describe('GET /', () => {
    beforeEach(async () => {
      await cleanupDb()
    })

    it('returns an error if user is not signed in', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `${ROOT_PATH}`,
      })
      expect(res.statusCode).toBe(StatusCode.UNAUTHORIZED)
    })

    it('returns an empty list if user has no stashes', async () => {
      const user = await RecordManager.createUser()
      const agent = await SessionManager.loginAsUser(app, user)

      // fetch stashes
      const res = await agent.get(ROOT_PATH)

      expect(res.status).toBe(StatusCode.OK)
      expect(res.body.stashes).toEqual([])
    })

    it("doesn't return other users' stashes", async () => {
      await RecordManager.loadFixture('stashes/stashes.with-user#1')
      const user = await RecordManager.createUser({ id: 2 })
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(ROOT_PATH)
      expect(res.status).toBe(StatusCode.OK)
      expect(res.body.stashes).toEqual([])
    })

    it("returns a list of the user's stashes", async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture('stashes/stashes.for-user#1')
      const stashes = await Stash.query()
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(ROOT_PATH)
      expect(res.status).toBe(StatusCode.OK)
      const resStashes = res.body.stashes as { [index: string]: any }[]

      expect(resStashes).toHaveLength(stashes.length)
      // Check they have the same ids
      const stashIds = stashes.map((i) => i.id).sort()
      const resStashIds = resStashes.map((i) => i.id).sort()
      expect(stashIds).toEqual(resStashIds)
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

    it('returns an error when the stash belongs to another user', async () => {
      const user = await RecordManager.createUser({ id: 2 })
      await RecordManager.loadFixture('stashes/stashes.with-user#1')
      const stashes = await Stash.query()
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(`${ROOT_PATH}/${stashes[0].id}`)
      expect(res.status).toBe(StatusCode.FORBIDDEN)
    })

    it('returns an error when the stash does not exist', async () => {
      const user = await RecordManager.createUser()
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(`${ROOT_PATH}/1`)
      expect(res.status).toBe(StatusCode.NOT_FOUND)
      expect(res.body.message).toMatch(/found/i)
    })

    it('returns the correct stash and its items', async () => {
      const user = await RecordManager.createUser({ id: 1 })
      await RecordManager.loadFixture(
        'stashes/stash.with-items.for-user#1')
      const stashes = await Stash
        .query()
        .modify('defaultSelects')
      const stash = stashes[0]
      const agent = await SessionManager.loginAsUser(app, user)

      const res = await agent.get(`${ROOT_PATH}/${stash.id}`)
      expect(res.status).toBe(StatusCode.OK)
      expect(res.body).toHaveProperty('stash')
      const bodyStash = res.body.stash
      expect(bodyStash).toHaveProperty('id', stash.id)
      expect(bodyStash).toHaveProperty('name', stash.name)
      expect(bodyStash).toHaveProperty('address', stash.address)
      expect(bodyStash).toHaveProperty('notes', stash.notes)

      expect(bodyStash).toHaveProperty('items')
      expect(bodyStash.items.length).toEqual(stash.items.length)
      expect(bodyStash.items[0].id).toEqual(stash.items[0].id)
      expect(bodyStash.items[0].name).toEqual(stash.items[0].name)
    })
  })
})
