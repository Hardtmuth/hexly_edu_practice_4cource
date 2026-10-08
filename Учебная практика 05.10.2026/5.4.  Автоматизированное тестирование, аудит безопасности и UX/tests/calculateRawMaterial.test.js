import { expect, test, vi } from 'vitest'
import { calculateRawMaterial } from '../server/routes/products/products.service.js'

vi.mock('../server/plugins/db.js', () => ({
  pool: {
    query: vi.fn(),
  },
}))

test('Тест 1 (Cтандартный): Проверка обычного корректного расчета с известным результатом.', async () => {
  const { pool } = await import('../server/plugins/db.js')

  // Мокаем два вызова query:
  // 1 - getProductCoefficient
  // 2 - getMaterialDefectPercent
  pool.query
    .mockResolvedValueOnce({ rows: [{ coefficient: 1 }] })  // product_types
    .mockResolvedValueOnce({ rows: [{ waste_percent: 5 }] }) // material_types

  const result = await calculateRawMaterial(2, 2, 100, 2.0, 3.0)
  expect(result).toBe(630)
  expect(pool.query).toHaveBeenCalledTimes(2)
})

test('Тест 2 (Округление): Проверка, что дробный результат округляется строго в большую сторону (вверх) до целого числа.', async () => {
  const { pool } = await import('../server/plugins/db.js')

  pool.query
    .mockResolvedValueOnce({ rows: [{ coefficient: 2.2 }] })
    .mockResolvedValueOnce({ rows: [{ waste_percent: 10 }] })

  const result = await calculateRawMaterial(1, 2, 10, 2.0, 3.0)
  expect(result).toBe(146) // Результат без округления:  145.20000000000002
  expect(pool.query).toHaveBeenCalledTimes(2)
})

test('Тест 3 (Несуществующий тип): Проверка возврата -1 при передаче некорректных ID типов продукции/материала.', async () => {
  const { pool } = await import('../server/plugins/db.js')

  pool.query.mockReset()
  pool.query.mockResolvedValueOnce({ rows: [] }) // коэффициент не найден

  const result = await calculateRawMaterial(99, 1, 10, 2.0, 3.0)
  expect(result).toBe(-1)
})

test('Тест 4 (Отрицательные параметры): Проверка возврата -1 при передаче отрицательных размеров (param_1 или param_2).', async () => {
  const result = await calculateRawMaterial(1, 2, 10, -2.0, 3.0)
  expect(result).toBe(-1)
})

test('Тест 5 (Нулевое количество): Проверка возврата -1, если количество продукции равно нулю или меньше.', async () => {
  const result = await calculateRawMaterial(1, 2, -5, 2.0, 3.0)
  expect(result).toBe(-1)
})
