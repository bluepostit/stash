import { debug as debugModule } from 'debug'

const testNamespace = 'stash:test'
const debug = debugModule(testNamespace)
debug.color = '12' // blue; see https://github.com/visionmedia/debug/issues/761

if (process.env['VERBOSE']) {
  debugModule.enable(`stash:*,${testNamespace}`)
} else {
  debugModule.enable(testNamespace)
}

export default debug
