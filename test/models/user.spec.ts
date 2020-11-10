import mocker from 'mock-knex'
import knex from '../../src/config/knex'
import { User } from '../../src/models'
// @ts-ignore
import debug from '../util/debug'

describe('User', function () {
  const tracker = mocker.getTracker()
  beforeAll(() => {
    mocker.mock(knex)
  })
  beforeEach(() => {
    tracker.install()
  })
  afterEach(() => {
    tracker.uninstall()
  })
  afterAll(() => {
    mocker.unmock(knex)
  })

  describe('Creating a User object', function () {

    let user: User
    const email = 'test-user@stash.xyz'
    const password = '123456'

    const createUserWithPassword = async function () {
      tracker.on('query', (query) => {
        query.response([{
          id: 1,
          email: 'test@test.com',
        }])
      })
      user = await User
        .query()
        .insert({
          email,
          password
        })
      return user
    }

    test('creates a user with an id', async function () {
      await createUserWithPassword()
      expect(user).toHaveProperty('id')
      expect(user.id).toBeGreaterThan(0)

      tracker.uninstall()
      tracker.install()
      tracker.on('query', (query) => {
        query.response([{
          count: 1
        }])
      })
      const userCount = await User.query().resultSize()
      expect(userCount).toBe<number>(1)
    })

    test('creates a user with a hashed password', async function () {
      await createUserWithPassword()
      expect(user.password).not.toBe(password)
      const matching = user.checkPassword(password)
      return expect(matching).resolves.toBe(true)
    })

    test("shouldn't be created if the email format is invalid",
      async () => {
        const insert = User.query().insert({
          email: 'too.short',
          password
        })
        expect.assertions(2)
        await insert.catch(e => {
          expect(e.name).toBe('ValidationError')
          expect(e.message).toMatch(/email/i)
        })
      })

    test("shouldn't be created if the email is too short",
      async () => {
        const insert = User.query().insert({
          email: 'ab@cd.e',
          password
        })
        expect.assertions(2)
        await insert.catch(e => {
          expect(e.name).toBe('ValidationError')
          expect(e.message).toMatch(/email/i)
        })
      })

    test("shouldn't be created if the password is too short",
      async () => {
        const insert = User.query().insert({
          email,
          password: '12345'
        })
        expect.assertions(2)
        await insert.catch(e => {
          expect(e.name).toBe('ValidationError')
          expect(e.message).toMatch(/password.*short/i)
        })
    })
  })
})
