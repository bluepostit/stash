import { Model } from 'objection'
import Item from './item'
import User from './user'

const dependencyOrder: typeof Model[] = [ Item ]

export { dependencyOrder, Item, User }
