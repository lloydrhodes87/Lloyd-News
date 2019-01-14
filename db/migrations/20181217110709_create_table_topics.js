
exports.up = function (knex, Promise) {
  return knex.schema.createTable('topics', (topicTable) => {
    topicTable.string('slug').primary();
    topicTable.unique('slug');
    topicTable.text('description');
  });
};


exports.down = function (knex, Promise) {
  return knex.schema.dropTable('topics');
};
