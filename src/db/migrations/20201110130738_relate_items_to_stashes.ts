import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('items', (t) => {
    t.integer('stash_id').unsigned()
    t.foreign('stash_id').references('id').inTable('stashes')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('items', (t) => {
    t.dropForeign(['stash_id'])
    t.dropColumn('stash_id')
  })
}

