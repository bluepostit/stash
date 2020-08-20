import { Model, Modifiers } from 'objection'
import { User } from '.'

export default class Item extends Model {
  id!: number
  name!: string
  description!: string

  parent?: Item
  children?: Item[]

  static tableName = 'items'

  static jsonSchema = {
    type: 'object',
    required: ['name', 'description'],

    properties: {
      id: { type: 'integer' },
      parent_id: { type: ['integer', 'null'] },
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
    }
  })

  static modifiers: Modifiers = {
    defaultSelects(query) {
      query.select('id', 'name', 'description')
        .withGraphFetched('[parent,children]')
    }
  }
}
