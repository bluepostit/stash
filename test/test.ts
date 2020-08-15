import { execSync } from 'child_process'
import { exit } from 'process'
import { debug as debugModule } from 'debug'
import '../src/config/environment'
import '../src/config/knex'

const MIGRATE_COMMAND = 'knex migrate:latest'
const TEST_COMMAND = 'mocha'
const DEFAULT_TARGET = __dirname

const debug = (() => {
  const testNamespace = 'lyrix:test'
  const debug = debugModule(testNamespace)
  debug.color = '12' // blue; see https://github.com/visionmedia/debug/issues/761

  if (process.env['VERBOSE']) {
    debugModule.enable(`stash:*,${testNamespace}`)
  } else {
    debugModule.enable(testNamespace)
  }
  return debug
})()

const run = (command: string) => {
  debug(command)
  execSync(command, { stdio: 'inherit' })
}

const test = (target: string, args?: string[]) => {
  try {
    run(MIGRATE_COMMAND)
    let rest = ''
    if (args) {
      rest = args.map(r => r.replace(/\s/g, '\\ ')).join(' ')
    }
    run(`${TEST_COMMAND} ${target}/**/*.spec.ts ${rest}`)
  } catch (e) {
    console.log(e.message)
    exit(-1)
  }
  debug('Tests complete.')
}


const main = () => {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    return test(DEFAULT_TARGET)
  }

  let [target, ...rest] = args
  test(target, rest)
}

main()
