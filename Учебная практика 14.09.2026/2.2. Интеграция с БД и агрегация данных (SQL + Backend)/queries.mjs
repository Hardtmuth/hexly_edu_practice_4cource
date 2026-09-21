import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASS || 'password',
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5436,
  database: process.env.PG_DB || 'practice',
})

// Получить список INN всех партнёров
export const getPartnersInn = async () => {
  try {
    const res = await pool.query('SELECT inn FROM partners')
    return res.rows.map((r) => r.inn);
  } catch (e) {
    console.error('Ошибка получения INN партнёров:', e)
    throw e
  }
}

// Данные одного партнёра (без агрегации)
export const getPartnerData = async (partnerInn) => {
  try {
    const res = await pool.query(
      'SELECT * FROM partners WHERE inn = $1',
      [partnerInn]
    )
    return res.rows;
  } catch (e) {
    console.error('Ошибка получения данных партнёра:', e)
    throw e
  }
};

// Суммарное количество продаж по одному партнёру (с LEFT JOIN и COALESCE)
export const getPartnerTotalQuantity = async (partnerInn) => {
  try {
    const res = await pool.query(
      `SELECT COALESCE(SUM(s.quantity), 0) AS total_quantity
       FROM partners p
       LEFT JOIN sales s ON p.partner_id = s.partner_id
       WHERE p.inn = $1`,
      [partnerInn]
    )
    return Number(res.rows[0].total_quantity);
  } catch (e) {
    console.error('Ошибка расчёта суммарного количества:', e.message)
    throw e
  }
};

// Список всех партнёров с суммарным количеством (эффективно одним запросом)
export const getAllPartnersWithTotalQuantity = async () => {
  try {
    const res = await pool.query(`
      SELECT
         p.partner_id,
         p.company_name,
         p.inn,
         p.contact_email,
         p.phone,
         p.address,
         p.rating,
         COALESCE(SUM(s.quantity), 0) AS total_quantity
       FROM partners p
       LEFT JOIN sales s ON p.partner_id = s.partner_id
       GROUP BY
         p.partner_id,
         p.company_name,
         p.inn,
         p.contact_email,
         p.phone,
         p.address,
         p.rating
       ORDER BY p.inn
    `);
    return res.rows
  } catch (e) {
    console.error('Ошибка выборки всех партнёров с итогами:', e)
    throw e
  }
}
