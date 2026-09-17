import { Pool } from 'pg'

const pool = new Pool({
  user:     process.env.PG_USER || 'postgres',
  password: process.env.PG_PASS || 'password',
  host:     process.env.PG_HOST || 'localhost',
  port:     process.env.PG_PORT ||  5436,
  database: process.env.PG_DB   || 'practice',
})

const getPartnersInn = async () => {
  try {
    const res = await pool.query('SELECT inn FROM partners')
    return res.rows.map(i => i.inn)
  }
  catch (e) {
    console.error('Ошибка получения данных из таблицы partners: ', e)
  }
}

const getPartnerData = async (partnerInn) => {
  try {
    const res = await pool.query('SELECT * FROM partners WHERE inn = $1', [partnerInn])
    return res.rows
  }
  catch (e) {
    console.error('Ошибка получения данных из таблицы partners: ', e)
  }
}

const getPartnerTotalQuantity = async (partnerInn) => {
  try {
    const res = await pool.query('SELECT SUM(quantity) FROM sales_history WHERE partner_inn = $1', [partnerInn])
    return parseInt(res.rows[0].sum, 10)
  }
  catch (e) {
    console.error('Ошибка выполнения запроса: ', e.message)
  }
}

export { getPartnersInn, getPartnerData, getPartnerTotalQuantity }
