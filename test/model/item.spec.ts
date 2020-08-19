import mocker from 'mock-knex'
import knex from '../../src/config/knex'
import Item from '../../src/models/item'
import * as fixtures from './item.spec.fixture'
// @ts-ignore
import debug from '../util/debug'

describe('Item', () => {
  const tracker = mocker.getTracker()
  beforeAll(() => {
    mocker.mock(knex)
  })
  beforeEach(() => {
    tracker.install()
  })
  afterEach(() => {
    tracker.uninstall()
  })
  afterAll(() => {
    mocker.unmock(knex)
  })

  const trackWith = (fixture: { [index: number]: object[] }) => {
    tracker.on('query', (query, step) => {
      let response: object[] = fixture[step - 1]
      query.response(response)
    })
  }

  describe('parents and children', () => {
    test('can become a child of another Item', async () => {
      trackWith(fixtures.anItemCanBecomeAChild)

      const items = await Item.query()
      let parent = items[0]
      let child = items[1]

      // Associate them
      await child
        .$relatedQuery('parent')
        .relate(parent)

      // Select them again, with associated children/parent items
      parent = await Item
        .query()
        .findById(parent.id)
        .modify('defaultSelects')
      child = await Item
        .query()
        .findById(child.id)
        .modify('defaultSelects')

      expect(parent.children).toHaveLength(1)
      // @ts-ignore: Object is possibly 'undefined'
      expect(parent.children[0].id).toBe(child.id)
      expect(parent.parent).toBeNull()
      expect(child.parent).toBeInstanceOf(Item)
      // @ts-ignore: Object is possibly 'undefined'
      expect(child.parent.id).toBe(parent.id)
      expect(child.children).toHaveLength(0)
    })

    test.only('can be removed from its parent Item', async () => {
      trackWith(fixtures.anItemCanBeRemovedFromItsParent)

      let items = await Item
        .query()
        .modify('defaultSelects')
      let parent = items[0]
      expect(parent).not.toBeNull()
      const childCountBefore = (parent.children as Item[]).length

      // Remove an item from its parent
      let child = (parent.children as Item[])[0]
      await child
        .$relatedQuery('parent')
        .unrelate()

      // Reload the items
      parent = await Item
        .query()
        .findById(parent.id)
        .modify('defaultSelects')
      child = await Item
        .query()
        .findById(child.id)
        .modify('defaultSelects')

      // // Check
      expect((parent.children as Item[]).length)
        .toBe(childCountBefore - 1)
      expect(child.parent).toBeNull()
    })
  })
})
