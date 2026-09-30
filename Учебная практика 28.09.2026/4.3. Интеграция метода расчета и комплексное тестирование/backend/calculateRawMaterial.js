const { ceil } = Math
import { getProductCoefficient, getMaterialDefectPercent } from './queries.mjs'

// Мок-справочники БД
const PRODUCT_TYPES = {
  1: 1.5,  // коэффициент типа продукции
  2: 2.0,
  3: 0.8,
}

const MATERIAL_TYPES = {
  10: 3.0,   // процент брака материала
  11: 5.5,
  12: 7.0,
}

/* // Имитация запроса к БД: возвращает коэффициент типа продукции.
// SELECT coefficient FROM product_types WHERE id = $1, [productTypeId]
const getProductCoefficient = (productTypeId) => {
  return PRODUCT_TYPES[productTypeId] ?? null
}

// Имитация запроса к БД: возвращает процент брака материала.
// SELECT waste_percent FROM material_types WHERE id = $1, [materialTypeId]
const getMaterialDefectPercent = (materialTypeId) => {
  return MATERIAL_TYPES[materialTypeId] ?? null
} */


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

  // 1. Базовый расход на 1 ед.
  const basePerUnit = param1 * param2 * coefficient

  // 2. Общий чистый расход
  const totalClean = basePerUnit * quantity

  // 3. Итоговый расход с учётом брака
  const totalWithDefect = totalClean * (1 + defectPercent / 100)

  // 4. Округление в большую сторону
  return ceil(totalWithDefect)
}
