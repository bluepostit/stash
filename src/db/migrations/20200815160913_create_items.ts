import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('items', table => {
      table.increments('id').primary()

      table.string('name')
      table.string('description')
      table.timestamps(true, true)

      table
        .integer('parent_id')
        .unsigned()
        .references('id')
        .inTable('items')
        .onDelete('SET NULL')
        .index()
    })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('items')
}

