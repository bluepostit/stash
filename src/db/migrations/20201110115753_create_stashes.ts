import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('stashes', table => {
      table.increments('id').primary()

      table.string('name')
      table.string('address')
      table.text('notes')
      table.timestamps(true, true)

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index()
    })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('stashes')
}

