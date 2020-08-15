declare module 'simple-knex-fixtures' {
  import Knex from 'knex'

  export function loadFile(
    path: string, configuration: Knex): Promise<void>

  export function loadFiles(
    path: string, configuration: Knex): Promise<void>

  export function loadFiles(
    paths: string[], configuration: Knex): Promise<void>
}
