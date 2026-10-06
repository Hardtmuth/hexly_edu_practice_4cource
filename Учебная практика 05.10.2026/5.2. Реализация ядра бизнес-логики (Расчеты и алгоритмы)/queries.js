import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASS || 'password',
  host: process.env.PG_HOST     || 'localhost',
  port: process.env.PG_PORT     ||  5438,
  database: process.env.PG_DB   || 'practice5',
})

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
