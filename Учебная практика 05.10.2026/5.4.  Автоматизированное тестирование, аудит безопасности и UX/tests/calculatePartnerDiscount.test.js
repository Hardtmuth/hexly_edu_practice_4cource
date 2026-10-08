import { expect, test } from 'vitest'
import { calculatePartnerDiscount } from '../server/routes/partners/partners.service'

test.for([
  { inbound: 9999,   expected: 0 },
  { inbound: 10000,  expected: 5 },
  { inbound: 49999,  expected: 5 },
  { inbound: 50000,  expected: 10 },
  { inbound: 299999, expected: 10 },
  { inbound: 300000, expected: 15 },
])('Тест: Входящее количество $inbound -> Скидка $expected %', ({ inbound, expected }) => {
  expect(calculatePartnerDiscount(inbound)).toBe(expected)
})