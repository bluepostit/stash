import { Model } from 'objection'
import Item from './item'
import Stash from './stash'
import User from './user'

const dependencyOrder: typeof Model[] = [ Stash, Item, User ]

export { dependencyOrder, Item, Stash, User, Model }
export default [ Item, Stash, User ]

interface BelongsToUser {
  user_id: number | null
}

export { BelongsToUser }
