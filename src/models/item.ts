import { Model } from 'objection'

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
        from: 'persons.id',
        to: 'persons.parent_id'
      }
    }
  })
}
