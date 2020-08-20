import path from 'path'
import { Model } from 'objection'
import fixtures from 'simple-knex-fixtures'
import { dependencyOrder as Models, User } from '../../src/models'
// @ts-ignore
import debug from './debug'

import knex from '../../src/config/knex'

interface RecordManagerInterface {
  loadFixture (name: string): Promise<void>
  deleteAll(models?: typeof Model[]): Promise<void>
  createUser(params?: UserData): Promise<TestUser>
}

type UserData = {
  id?: number
  email?: string
  password?: string
}

const DEFAULT_USER_DATA: UserData = {
  email: 'person@record-manager.com',
  password: '123456'
}

class TestUser extends User {
  unencryptedPassword: string = ''

  static createFromUser(user: User) {
    let testUser: TestUser = new TestUser()
    testUser.id = user.id
    testUser.email = user.email
    testUser.password = user.password
    testUser.name = user.name
    return testUser
  }
}

const RecordManager: RecordManagerInterface = class RecordManager {
  static async loadFixture(name: string) {
    const dirPrefix = path.join(__dirname, '../fixtures')
    await fixtures.loadFile(
      `${dirPrefix}/${name}.json`,
      knex
    )
  }

  static async deleteAll(models?: typeof Model[]) {
    models = models || Models
    for (const model of models) {
      await model
        .query()
        .delete()
    }
  }

  static async createUser(params?: UserData): Promise<TestUser> {
    // Needed to avoid sharing `data` between calls!
    const data: UserData = { ...DEFAULT_USER_DATA }
    if (params) {
      data.id = params.id || data.id
      data.email = params.email || data.email
      data.password = params.password || data.password
    }
    // try {
      const user: User = await User.query().insert(data)
      const testUser = TestUser.createFromUser(user)
      testUser.unencryptedPassword = (data.password as string)
      return testUser
    // } catch (err) {
    //   debug(err)
    //   throw err
    // }
  }
}

export { RecordManager as default, TestUser }
