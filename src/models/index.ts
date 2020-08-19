import { Model } from 'objection'
import Item from './item'
import User from './user'

const dependencyOrder: typeof Model[] = [ User, Item ]

export { dependencyOrder, Item, User }
export default [ Item, User ]
