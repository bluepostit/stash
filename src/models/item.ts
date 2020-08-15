import { Model } from 'objection'

export default class Item extends Model {
  id!: number
  name!: string
  description!: string
}
