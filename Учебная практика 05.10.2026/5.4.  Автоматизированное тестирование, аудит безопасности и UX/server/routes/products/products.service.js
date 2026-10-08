import { pool } from '../../plugins/db.js'
const { ceil } = Math


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

// Расчёт расхода сырья.
// Возвращает -1 при любых ошибках валидации или отсутствии записей в БД.
export const calculateRawMaterial = async (productTypeId, materialTypeId, quantity, param1, param2) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return -1
  }

  const areValidParams =
    typeof param1 === 'number' && param1 > 0 &&
    typeof param2 === 'number' && param2 > 0

  if (!areValidParams) {
    return -1
  }

  // Коэффициент и процент брака — асинхронные запросы к БД
  const productTypeRow = await getProductCoefficient(productTypeId)
  if (!productTypeRow) {
    return -1
  }

  const materialTypeRow = await getMaterialDefectPercent(materialTypeId)
  if (!materialTypeRow) {
    return -1
  }

  const coefficient = Number(productTypeRow.coefficient)
  const defectPercent = Number(materialTypeRow.waste_percent)

  const total = quantity * param1 * param2 * coefficient * (1 + defectPercent / 100)
  // console.log('Результат без округления: ', total)
  return ceil(total)
}

