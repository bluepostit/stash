exports.mochaHooks = {
  beforeEach(done: () => void) {
    require('../src/config/environment')
    require('../src/config/knex')

    done()
  }
}
