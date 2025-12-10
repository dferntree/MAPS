const { drizzle } = require('drizzle-orm/postgres-js')

const postgres = require('postgres')

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

const connectionString = process.env.DATABASE_URL

const client = postgres(connectionString)

const db = drizzle(client)

module.exports = { db }