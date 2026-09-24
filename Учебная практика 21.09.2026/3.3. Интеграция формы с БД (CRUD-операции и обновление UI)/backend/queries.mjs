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
}

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
         p.legal_form,
         p.company_name,
         p.director_name,
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
         p.legal_form,
         p.company_name,
         p.director_name,
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

export const addPartner = async (partnerData) => {
  const {
    legal_form,
    company_name,
    inn,
    contact_email,
    phone,
    address,
    rating,
    director_name
  } = partnerData

  try {
    const res = await pool.query(
      `INSERT INTO partners (legal_form, company_name, inn, contact_email, phone, address, rating, director_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [legal_form, company_name, inn, contact_email, phone, address, rating, director_name]
    );
    return res.rows[0];
  } catch (e) {
    console.error('Ошибка добавления партнёра:', e)
    throw e
  }
}

export const updatePartner = async (partnerId, partnerData) => {
  const {
    legal_form,
    inn,
    company_name,
    contact_email,
    phone,
    address,
    rating,
    director_name,
  } = partnerData

  try {
    const res = await pool.query(
      `UPDATE partners
       SET
         legal_form = COALESCE($1, legal_form),
         company_name = COALESCE($2, company_name),
         contact_email = COALESCE($3, contact_email),
         phone = COALESCE($4, phone),
         address = COALESCE($5, address),
         rating = COALESCE($6, rating),
         director_name = COALESCE($7, director_name),
         inn = COALESCE($8, inn)
       WHERE partner_id = $9
       RETURNING *`,
      [
        legal_form,
        company_name,
        contact_email,
        phone,
        address,
        rating,
        director_name,
        inn,
        partnerId,
      ]
    )

    return res.rows[0] || null;
  } catch (e) {
    console.error('Ошибка обновления партнёра:', e)
    throw e
  }
}
