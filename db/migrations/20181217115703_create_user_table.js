
exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', (userTable) => {
    userTable.string('username').primary();
    userTable.unique('username');
    userTable.text('avatar_url');
    userTable.string('name');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users');
};
