import path from 'path'
import { Model } from 'objection'
import fixtures from 'simple-knex-fixtures'
import { dependencyOrder as Models } from '../../src/models'
import debug from './debug'

import { config as knexConfig } from '../../src/config/knex'

interface RecordManagerInterface {
  loadFixture (name: string): Promise<void>
  deleteAll(models?: typeof Model[]): Promise<void>
}

const RecordManager: RecordManagerInterface = class RecordManager {
  static async loadFixture(name: string) {
    debug(`loading fixture '${name}'`)
    const dirPrefix = path.join(__dirname, '../fixtures')
    await fixtures.loadFile(
      `${dirPrefix}/${name}.json`,
      knexConfig.connection
    )
  }

  static async deleteAll(models?: typeof Model[]) {
    models = models || Models
    for (const model of models) {
      debug(`deleting all ${model.name}s`)
      await model
        .query()
        .delete()
    }
  }
}

export default RecordManager
