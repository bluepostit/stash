import { Model, Modifiers } from 'objection'
import { Stash, User, BelongsToUser } from '.'

export default class Item extends Model implements BelongsToUser {
  id!: number
  name!: string
  description!: string
  user_id!: number
  created_at!: Date

  user!: User | null
  parent!: Item | null
  children!: Item[]
  stash!: Stash | null

  static tableName = 'items'

  static jsonSchema = {
    type: 'object',
    required: ['name', 'description'],

    properties: {
      id: { type: 'integer' },
      parent_id: { type: ['integer', 'null'] },
      stash_id: { type: ['integer', 'null'] },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', minLength: 1, maxLength: 255 }
    }
  }

  static relationMappings = () => ({
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'items.user_id',
        to: 'users.id'
      }
    },

    parent: {
      relation: Model.BelongsToOneRelation,
      modelClass: Item,
      join: {
        from: 'items.parent_id',
        to: 'items.id'
      }
    },

    children: {
      relation: Model.HasManyRelation,
      modelClass: Item,
      join: {
        from: 'items.id',
        to: 'items.parent_id'
      }
    },

    stash: {
      relation: Model.BelongsToOneRelation,
      modelClass: Stash,
      join: {
        from: 'items.stash_id',
        to: 'stashes.id'
      }
    }
  })

  static modifiers: Modifiers = {
    defaultSelects(query) {
      const { ref } = Item
      query.select(
        ref('id'),
        ref('name'),
        ref('description'),
        ref('created_at'))
        .withGraphFetched('[parent, children, stash, user(onlyId)]')
    }
  }
}
