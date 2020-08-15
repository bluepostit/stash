import { Model } from 'objection'
import Item from './item'

const dependencyOrder: typeof Model[] = [ Item ]

export { dependencyOrder, Item }
