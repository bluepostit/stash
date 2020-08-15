import { expect } from 'chai'
import Item from '../../src/models/item'
import RecordManager from '../util/record-manager'
// import debug from '../util/debug'

describe('Item', () => {
  beforeEach(async () => {
    RecordManager.deleteAll()
  })

  after(async () => {
    RecordManager.deleteAll()
  })

  describe('#constructor', () => {
    it('should create an Item with an assigned id', async () => {
      const guitar: Item = await Item
        .query()
        .insert({
          name: 'Guitar',
          description: 'Acoustic steel-string, slightly scratched'
        })
      expect(guitar.id).to.be.a('number')
    })
  })

  describe('parents and children', () => {
    it('can be added as a child of another Item', async () => {
      await RecordManager.loadFixture('items/items.no-children')
      let items = await Item.query()
      let parentItem = items[0]
      let childItem = items[1]
      let [parentId, childId] = [parentItem.id, childItem.id]

      // Associate them
      await childItem
        .$relatedQuery('parent')
        .relate(parentItem)

      parentItem = await Item
        .query()
        .findById(parentId)
        .withGraphFetched('[parent,children]')
      childItem = await Item
        .query()
        .findById(childId)
        .withGraphFetched('[parent,children]')

      expect(parentItem.children).to.have.lengthOf(1)
      // @ts-ignore: Object is possibly 'undefined'
      expect(parentItem.children[0].id).to.eql(childItem.id)
      expect(parentItem.parent).to.eql(null)
      expect(childItem.parent).to.be.an('object')
      // @ts-ignore: Object is possibly 'undefined'
      expect(childItem.parent.id).to.eql(parentItem.id)
      expect(childItem.children).to.have.lengthOf(0)
    })

    it('can have no parent Item')
    it('can have children Items')
    it('can have no children Items')
  })
})
