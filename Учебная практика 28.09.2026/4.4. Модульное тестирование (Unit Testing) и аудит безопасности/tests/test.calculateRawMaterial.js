import assert from 'assert'
import { calculateRawMaterial } from '../backend/calculateRawMaterial.js'

const red = '\x1b[41m'
const green = '\x1b[42m'
const reset = '\x1b[0m'

const testCases = [
  { in: { productTypeId: 1, materialTypeId: 2, quantity: 10, param1: 2.0, param2: 3.0 }, out: 68 },  // - Тест 1 (Стандартный): Проверка обычного корректного расчета с известным результатом.
  { in: { productTypeId: 2, materialTypeId: 1, quantity: 10, param1: 2.0, param2: 3.0 }, out: 66 },  // - Тест 2 (Округление): Проверка, что дробный результат округляется строго в большую сторону (вверх) до целого числа. (Результат без округления:  65.205)
  { in: { productTypeId: 99, materialTypeId: 1, quantity: 10, param1: 2.0, param2: 3.0 }, out: -1 }, // - Тест 3 (Несуществующий тип): Проверка возврата -1 при передаче некорректных ID типов продукции/материала.
  { in: { productTypeId: 1, materialTypeId: 2, quantity: 10, param1: -2.0, param2: 3.0 }, out: -1 }, // - Тест 4 (Отрицательные параметры): Проверка возврата -1 при передаче отрицательных размеров (`param_1` или `param_2`).
  { in: { productTypeId: 1, materialTypeId: 2, quantity: -5, param1: 2.0, param2: 3.0 }, out: -1 },  // - Тест 5 (Нулевое количество): Проверка возврата -1, если количество продукции равно нулю или меньше.
]

const runTests = async () => {
  let success = true

  for (const test of testCases) {
    const { productTypeId, materialTypeId, quantity, param1, param2 } = test.in
    try {
      const result = await calculateRawMaterial(productTypeId, materialTypeId, quantity, param1, param2)
      assert.equal(
        result,
        test.out,
        `Входящее значение: ${JSON.stringify(test.in)}\n` +
        `Полученное значение: ${result}\n` +
        `Ожидаемое значение: ${test.out}`
      )
    } catch (e) {
      success = false
      console.error(
      `${red}Ошибка (выброшено исключение):${reset}\n` +
      `${e.message}`
      )
    }
  }

  if (success) {
    console.log(`${green}Все тесты прошли успешно${reset}`)
    process.exit(0)
  } else {
    console.error(`${red}Некоторые тесты не прошли${reset}`)
    process.exit(1)
  }
}

runTests()
