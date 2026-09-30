import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASS || 'password',
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5436,
  database: process.env.PG_DB || 'practice',
})

// Валидация данных партнёра перед добавлением или обновлением
export const validatePartnerData = (data) => {
  // Обязательные поля: company_name и contact_email
  if (!data.company_name || data.company_name.trim() === '') {
    throw new Error('Наименование компании обязательно и не может быть пустым.')
  }
  if (!data.contact_email || data.contact_email.trim() === '') {
    throw new Error('Email обязателен и не может быть пустым.')
  }

  // Рейтинг: неотрицательное число (если передан)
  if (data.rating !== undefined && data.rating !== null && data.rating !== '') {
    const parsed = Number(data.rating)
    if (Number.isNaN(parsed)) {
      throw new Error('Рейтинг должен быть числом.')
    }
    if (parsed < 0) {
      throw new Error('Рейтинг не может быть отрицательным.')
    }
  }

  // ИНН: обязательное поле, не пустое
  if (!data.inn || data.inn.trim() === '') {
    throw new Error('ИНН обязателен.')
  }
}

// Получить список INN всех партнёров
export const getPartnersInn = async () => {
  try {
    const res = await pool.query('SELECT inn FROM partners')
    return res.rows.map((r) => r.inn)
  } catch (e) {
    console.error('Ошибка получения INN партнёров:', e)
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
    return Number(res.rows[0].total_quantity)
  } catch (e) {
    console.error('Ошибка расчёта суммарного количества:', e.message)
    throw e
  }
}

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
    `)
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
    validatePartnerData(partnerData)
  } catch (validationError) {
    throw validationError
  }

  try {
    const res = await pool.query(
      `INSERT INTO partners (legal_form, company_name, inn, contact_email, phone, address, rating, director_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [legal_form, company_name, inn, contact_email, phone, address, rating, director_name]
    )
    return res.rows[0]
  } catch (e) {
    if (e.code === '23505') { // unique_violation
      throw new Error('Партнёр с таким ИНН или email уже существует.')
    }
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
    validatePartnerData(partnerData)
  } catch (validationError) {
    throw validationError
  }

  // Нормализация рейтинга
  let ratingValue = rating
  if (rating === '' || rating === undefined) {
    ratingValue = null
  } else {
    ratingValue = Number(rating)
  }

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
        ratingValue,
        director_name,
        inn,
        partnerId,
      ]
    )

    return res.rows[0] || null
  } catch (e) {
    console.error('Ошибка обновления партнёра:', e)
    throw e
  }
}

export const getSalesHistory = async (partnerId) => {
  try {
    const res = await pool.query(
      `SELECT
        s.sale_id,
        p.product_name,
        s.quantity,
        TO_CHAR(s.created_at, 'DD.MM.YYYY') AS sale_date
      FROM sales s
      INNER JOIN products p ON s.product_id = p.product_id
      WHERE s.partner_id = $1
      ORDER BY s.created_at DESC;
      `,
      [partnerId]
    )
    return res.rows
  } catch (e) {
    console.error('Ошибка получения данных партнёра:', e)
    throw e
  }
}

export const getPartners = async () => {
  const client = await pool.connect()
  try {
    const res = await client.query('SELECT * FROM partners ORDER BY partner_id')
    return res.rows
  } catch (e) {
    console.error('Ошибка получения списка партнёров:', e)
    throw e
  }
}

export const getPartner = async (partnerId) => {
  try {
    const res = await pool.query(
      `SELECT company_name, legal_form FROM partners WHERE partner_id = $1`,
      [partnerId]
    )
    return res.rows[0]
  } catch (e) {
    console.error('Ошибка получения данных партнёра:', e)
    throw e
  }
}

export const getProducts = async () => {
  try {
    const res = await pool.query(
      `SELECT product_id, product_name, product_type_id, material_type_id FROM products`,
    )
    return res.rows ?? null
  } catch (e) {
    console.error('Ошибка получения списка продуктов:', e)
    throw e
  }
}

export const getProduct = async (productId) => {
  try {
    const res = await pool.query(
      `SELECT product_id, product_name, product_type_id, material_type_id FROM products WHERE product_id = $1`,
      [productId]
    )
    return res.rows[0] ?? null
  } catch (e) {
    console.error('Ошибка получения данных продукта:', e)
    throw e
  }
}

export const getProductCoefficient = async (productTypeId) => {
  try {
    const res = await pool.query(
      `SELECT coefficient FROM product_types WHERE product_type_id = $1`,
      [productTypeId]
    )
    return res.rows[0] ?? null
  } catch (e) {
    console.error('Ошибка получения коэффициента:', e)
    throw e
  }
}

export const getMaterialDefectPercent = async (materialTypeId) => {
  try {
    const res = await pool.query(
      `SELECT waste_percent FROM material_types WHERE material_type_id = $1`,
      [materialTypeId]
    )
    return res.rows[0] ?? null
  } catch (e) {
    console.error('Ошибка получения процента брака материала:', e)
    throw e
  }
}