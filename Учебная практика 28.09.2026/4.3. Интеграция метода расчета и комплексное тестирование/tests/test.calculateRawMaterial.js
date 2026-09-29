import assert from 'assert'
import { calculateRawMaterial } from '../backend/calculateRawMaterial.js'

const red = '\x1b[41m'
const green = '\x1b[42m'
const reset = '\x1b[0m'

const testCases = [
  { in: { productTypeId: 1, materialTypeId: 10, quantity: 10, param1: 2.0, param2: 3.0 }, out: 93 },
  { in: { productTypeId: 99, materialTypeId: 10, quantity: 10, param1: 2.0, param2: 3.0 }, out: -1 }, // несуществующий productTypeId
  { in: { productTypeId: 1, materialTypeId: 99, quantity: 10, param1: 2.0, param2: 3.0 }, out: -1 }, // несуществующий materialTypeId
  { in: { productTypeId: 1, materialTypeId: 10, quantity: -5, param1: 2.0, param2: 3.0 }, out: -1 }, // quantity < 0
  { in: { productTypeId: 1, materialTypeId: 10, quantity: 10, param1: -2.0, param2: 3.0 }, out: -1 }, // param1 < 0
]

let success = true

for (const test of testCases) {
  const { productTypeId, materialTypeId, quantity, param1, param2 } = test.in
  try {
    const result = calculateRawMaterial(productTypeId, materialTypeId, quantity, param1, param2)
    assert.equal(
      result,
      test.out,
      `Входящее значение:   ${test.in},
       Полученное значение: ${result},
       Ожидаемое значение:  ${test.out}
       Итог:                ${result} != ${test.out}`
    )
  } catch (e) {
    success = false
    console.error(`${red}Ошибка:${reset}${e.message}`)
  }

}

if (success) {
    console.log(`${green} Все тесты прошли успешно ${reset}`)
  }
