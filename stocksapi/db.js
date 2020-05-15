const { DB_ADDRESS,DB_PORT,DB_NAME,DB_USER,DB_PASSWORD,DB_CLIENT, DB_VERSION } = process.env
const knex = require('knex')({
    client: DB_CLIENT,
    version: DB_VERSION,
    connection: {
        host: DB_ADDRESS,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
    }
})

// Test connection
// https://github.com/knex/knex/issues/407#issuecomment-52858626
knex.raw('select 1+1 as result').then(function () {
    // there is a valid connection in the pool
    console.log("Database Connected")
}).catch((e) => console.error("Could not connect to database\n", e));


// Initialise the tables (ignoring error if already exists)
knex.schema.createTable('stocks', table => {
    table.date('timestamp')
    table.string('symbol')
    table.string('name')
    table.string('industry')
    table.float('open')
    table.float('high')
    table.float('low')
    table.float('close')
    table.float('volumes')
}).then(() => console.log("Stocks table created"))
    .catch((e) => e.code !== 'ER_TABLE_EXISTS_ERROR' ? console.log(e) : null)

knex.schema.createTable('users', table => {
    table.increments('id')
    table.string('email')
    table.string('password')
}).then(() => console.log("Users table created"))
    .catch((e) => e.code !== 'ER_TABLE_EXISTS_ERROR' ? console.log(e) : null)

module.exports = knex;