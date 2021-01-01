import { Model, Modifiers } from 'objection'
import { Item, User, BelongsToUser } from '.'

export default class Stash extends Model implements BelongsToUser {
  id!: number
  name!: string
  address!: string
  notes!: string
  user_id!: number

  user!: User | null
  items!: Item[]

  static tableName = 'stashes'

  static jsonSchema = {
    type: 'object',
    required: ['name', 'address'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 5, maxLength: 255 },
      address: { type: 'string', minLength: 5, maxLength: 500 },
      notes: { type: 'string', maxLength: 5000 }
    }
  }

  static relationMappings = () => ({
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'stashes.user_id',
        to: 'users.id'
      }
    },

    items: {
      relation: Model.HasManyRelation,
      modelClass: Item,
      join: {
        from: 'stashes.id',
        to: 'items.stash_id'
      }
    }
  })

  static modifiers: Modifiers = {
    defaultSelects(query) {
      query.select('id', 'name', 'address', 'notes', 'user_id')
        .withGraphFetched('[items(defaultSelects), user]')
    }
  }
}
