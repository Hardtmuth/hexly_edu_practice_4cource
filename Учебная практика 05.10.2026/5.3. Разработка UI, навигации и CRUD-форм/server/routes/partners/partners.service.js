import { pool } from '../../plugins/db.js'

// Валидация данных партнёра перед добавлением или обновлением
export const validatePartnerData = (data) => {
  // Обязательные поля: partner_name и email
  if (!data.partner_name || data.partner_name.trim() === '') {
    throw new Error('Наименование компании обязательно и не может быть пустым.')
  }
  if (!data.email || data.email.trim() === '') {
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

export const getPartnerById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM partners WHERE partner_id = $1', [id])
  return rows[0] || null
}

export const getPartners = async (page = 1, limit = 20, search = null) => {
  const offset = (page - 1) * limit

  const whereClause = search
    ? ' WHERE name ILIKE $1 OR email ILIKE $1'
    : ''

  // В запросе на выборку LIMIT и OFFSET — это всегда $1 и $2
  const query = `SELECT * FROM partners${whereClause} ORDER BY partner_id DESC LIMIT $1 OFFSET $2`

  // Для подсчёта общего количества WHERE тот же, но без LIMIT/OFFSET
  const countQuery = `SELECT COUNT(*) FROM partners${whereClause}`

  const params = search ? [`%${search}%`] : []

  const { rows } = await pool.query(query, [...params, limit, offset])
  const { rows: countRows } = await pool.query(countQuery, params)

  return {
    items: rows,
    total: parseInt(countRows[0].count, 10),
    page,
    limit,
  }
}

export const createPartner = async (data) => {
  const { legal_form, partner_name, inn, email, phone, address, director_name, rating } = data
  const { rows } = await pool.query(
    `INSERT INTO partners (legal_form, partner_name, inn, email, phone, address, director_name, rating)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [legal_form, partner_name, inn, email, phone, address, director_name, rating]
  )
  return rows[0]
}

export const updatePartner = async (partnerId, partnerData) => {
  const {
    legal_form,
    inn,
    partner_name,
    email,
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
         partner_name = COALESCE($2, partner_name),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         address = COALESCE($5, address),
         rating = COALESCE($6, rating),
         director_name = COALESCE($7, director_name),
         inn = COALESCE($8, inn)
       WHERE partner_id = $9
       RETURNING *`,
      [
        legal_form,
        partner_name,
        email,
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

export const deletePartner = async (id) => {
  await pool.query('DELETE FROM partners WHERE partner_id = $1', [id])
  return true
}

export const calculatePartnerDiscount = (totalQuantity) => {
  if (!totalQuantity) return 0
  return (
    totalQuantity < 10000
      ? 0
      : totalQuantity < 50000
        ? 5
        : totalQuantity < 300000
          ? 10
          : 15
  )
}

export const getAllPartnersWithTotalQuantity = async () => {
  try {
    const res = await pool.query(`
      SELECT
         p.partner_id,
         p.legal_form,
         p.partner_name,
         p.director_name,
         p.inn,
         p.email,
         p.phone,
         p.address,
         p.rating,
         COALESCE(SUM(s.quantity), 0) AS total_quantity
       FROM partners p
       LEFT JOIN sales_history s ON p.partner_id = s.partner_id
       GROUP BY
         p.partner_id,
         p.legal_form,
         p.partner_name,
         p.director_name,
         p.inn,
         p.email,
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

export const getPartnersSummary = async () => {
  const partnersWithTotals = await getAllPartnersWithTotalQuantity()

  return partnersWithTotals.map((p) => ({
    ...p,
    discount: calculatePartnerDiscount(p.total_quantity),
  }))
}

export const getSalesHistory = async (partnerId) => {
  try {
    const res = await pool.query(
      `SELECT
        s.sale_id,
        p.product_name,
        s.quantity,
        TO_CHAR(s.sale_date, 'DD.MM.YYYY') AS sale_date
      FROM sales_history s
      INNER JOIN products p ON s.product_id = p.product_id
      WHERE s.partner_id = $1
      ORDER BY s.sale_date DESC;
      `,
      [partnerId]
    )
    return res.rows
  } catch (e) {
    console.error('Ошибка получения данных партнёра:', e)
    throw e
  }
}
