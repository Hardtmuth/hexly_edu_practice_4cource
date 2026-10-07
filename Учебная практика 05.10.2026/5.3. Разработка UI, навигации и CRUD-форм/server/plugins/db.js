import fp from 'fastify-plugin'
import postgres from '@fastify/postgres'
import { Pool } from 'pg'

export const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
})

pool.on('connect', () => console.info('БД подключена к пулу'))
pool.on('error', (err) => console.error('Ошибка пула БД:', err))

const dbPlugin = async (app, opts) => {
  await app.register(postgres, { client: pool })
}

export default fp(dbPlugin)
