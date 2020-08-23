import { Model } from 'objection'
import Item from './item'
import User from './user'

const dependencyOrder: typeof Model[] = [ Item, User ]

export { dependencyOrder, Item, User }
export default [ Item, User ]

interface BelongsToUser {
  user_id: number | null
}

export { BelongsToUser }
