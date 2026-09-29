import assert from 'assert'
import { calculatePartnerDiscount } from '../backend/business_logic.mjs'

const red = '\x1b[41m'
const green = '\x1b[42m'
const reset = '\x1b[0m'

const testCases = [
  { in: 9999, out: 0 },
  { in: 10000, out: 5 },
  { in: 49999, out: 5 },
  { in: 50000, out: 10 },
  { in: 300000, out: 15 },
]

let success = true

for (const test of testCases) {
  try {
    const result = calculatePartnerDiscount(test.in)
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
