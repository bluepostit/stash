import { expect } from 'chai'
import Item from '../../src/models/item'
import RecordManager from '../util/record-manager'

describe('Item', () => {
  beforeEach(async () => {
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
    it('can have a parent Item', () => {

    })

    it('can have no parent Item')
    it('can have children Items')
    it('can have no children Items')
  })
})
