import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('items', t => {
    t.integer('user_id').unsigned()
    t.foreign('user_id').references('id').inTable('users')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('items', t => {
    t.dropForeign(['user_id'])
    t.dropColumn('user_id')
  })
}

