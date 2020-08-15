import { expect } from 'chai'
import Item from '../../src/models/item'

describe('Item', () => {
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
})
