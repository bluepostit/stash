declare module 'simple-knex-fixtures' {
  import Knex, { ConnectionConfig } from 'knex'

  export function loadFile(
    path: string, connection: ConnectionConfig): Promise<void>

  export function loadFiles(
    path: string, connection: ConnectionConfig): Promise<void>

  export function loadFiles(
    paths: string[], connection: ConnectionConfig): Promise<void>
}
