const { ceil } = Math
import { getProductCoefficient, getMaterialDefectPercent } from './queries.mjs'

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
