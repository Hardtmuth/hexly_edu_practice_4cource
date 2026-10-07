import fp from 'fastify-plugin'
import postgres from '@fastify/postgres'
import { Pool } from 'pg'

const dbPlugin = async (app, opts) => {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DB,
    password: process.env.PG_PASS,
  })

  pool.on('connect', () => app.log.info('База данных успешно подключена к пулу'))
  pool.on('error', (err) => app.log.error(err, 'Непредвиденная ошибка пула БД'))

  await app.register(postgres, {
    client: pool,
  })
}

export default fp(dbPlugin)
