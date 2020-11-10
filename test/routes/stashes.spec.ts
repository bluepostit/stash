import { FastifyInstance } from 'fastify'
// import { Stash } from '../../src/models'
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
  })

  it('returns an error if not signed in', async () => {
    const res = await app.inject({
      method: 'POST',
      url: ROOT_PATH,
      payload: {
        name: "Jenny's house",
        address: '21 Main Avenue, Springfield',
        notes: "Call Jenny first to let her know you're coming over"
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
      beforeAll(async () => {
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
