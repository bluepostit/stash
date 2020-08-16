import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

import { User } from '../../src/models'
import RecordManager from '../util/record-manager'
// @ts-ignore declared but its value is never used
import debug from '../util/debug'

describe('User', function () {
  const cleanup = async () => await RecordManager.deleteAll()
  beforeEach(async () => cleanup())
  after(async () => cleanup())

  describe('Creating a User object', function () {
    let user: User
    const password = '123456'
    const createUserWithPassword = async function () {
      user = await RecordManager.createUser({ password })
    }

    it('creates a user with an id', async function () {
      await createUserWithPassword()
      expect(user).to.haveOwnProperty('id')
      expect(user.id).to.be.greaterThan(0)
    })

    it('creates a user with a hashed password', async function () {
      await createUserWithPassword()
      // Assert it has data that will help us test.
      expect(user).to.haveOwnProperty('unencryptedPassword')
      expect(user.password).not.to.be.eql(password)
      const matching = user.checkPassword(password)
      return expect(matching).to.eventually.eql(true)
    })

    it("shouldn't be created if the email format is invalid",
      async function () {
        const promise = RecordManager.createUser({ email: 'this.is.no.email' })
        return expect(promise).to.be.rejectedWith(/email/i)
      })

    it("shouldn't be created if the email is too short",
      async function () {
        const promise = RecordManager.createUser({ email: 'ab@cd.e' })
        return expect(promise).to.be.rejectedWith(/email/i)
      })

    it("shouldn't be created if the password is too short",
    async function () {
      const promise = RecordManager.createUser({ password: '12345' })
      return expect(promise).to.eventually.be.rejectedWith(/password/i)
        .and.have.property('name', 'ValidationError')
    })
  })
})
