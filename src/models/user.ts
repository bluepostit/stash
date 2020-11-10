import { Model, Modifiers, QueryContext } from 'objection'
import bcrypt from 'bcrypt'
import Item from './item'
import Stash from './stash'

const HASH_SALT_ROUNDS = 10

export default class User extends Model {
  id!: number
  name!: string
  email!: string
  password!: string
  items!: Item[]
  stashes!: Stash[]

  static tableName = 'users'

  protected async encryptPassword() {
    const newPassword = await bcrypt.hash(
      this.password,
      HASH_SALT_ROUNDS)
    this.password = newPassword
  }

  async checkPassword(password: string) {
    try {
      const match = await bcrypt.compare(password, this.password)
      return match
    } catch (err) {
      console.log(err)
      return false
    }
  }

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext)
    await this.encryptPassword()
  }

  static jsonSchema = {
    type: 'object',
    required: ['email', 'password'],

    properties: {
      id: { type: 'integer' },
      email: {
        type: 'string',
        minLength: 8,
        maxLength: 255,
        format: 'email'
      },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      password: { type: 'string', minLength: 6, maxLength: 255 }
    }
  }

  static relationMappings = () => ({
    items: {
      relation: Model.HasManyRelation,
      modelClass: Item,
      join: {
        from: 'users.id',
        to: 'items.user_id'
      }
    },

    stashes: {
      relation: Model.HasManyRelation,
      modelClass: Stash,
      join: {
        from: 'users.id',
        to: 'stashes.user_id'
      }
    }
  })

  static modifiers: Modifiers = {
    defaultSelects(query) {
      query.select('id', 'name', 'email')
        .withGraphFetched('[items]')
    }
  }
}
