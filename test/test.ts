import { execSync } from 'child_process'
import yargs from 'yargs'
import { debug as debugModule } from 'debug'
import '../src/config/environment'
import '../src/config/knex'

const MIGRATE_COMMAND = 'knex migrate:latest'
const TEST_COMMAND = 'mocha'

const debug = (() => {
  const testNamespace = 'stash:test'
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

const main = () => {
  const argv = yargs
    .usage('Usage: $0 [options]')
    .example('$0 model', 'Run all tests in the `model` directory')
    .example('$0 **/*.spec.ts', 'Run all tests matching this glob')

    .alias('t', 'target')
    .nargs('t', 1)
    .default('target', '**/*.spec.ts')
    .describe('t', 'Specify test target (file or directory)')

    .boolean('w')
    .alias('w', 'watch')
    .describe('w', 'Watch files in the current working directory for changes')

    .boolean('r')
    .alias('r', 'recursive')
    .default('r', true)
    .describe('r', 'Look for tests in subdirectories')

    .help('h')
    .alias('h', 'help')
    .argv

  let target = argv.target || ''
  let testCommand = TEST_COMMAND
  if (argv.recursive) {
    testCommand += ' --recursive'
  }
  if (argv.watch) {
    testCommand += ' -w'
  }
  for (let letter of ['f', 'g', 's', 'c', 'a']) {
    if (argv[letter]) {
      testCommand += ` -${letter} '${argv[letter]}'`
    }
  }
  testCommand += ` '${target}'`

  run(MIGRATE_COMMAND)
  run(testCommand)
}

main()
