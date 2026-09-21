import { calculatePartnerDiscount } from '../../2.1. Разработка ядра бизнес-логики (Расчет скидки)/business_logic.mjs'
import { getAllPartnersWithTotalQuantity } from './queries.mjs'

export const getPartnersSummary = async () => {
  const partnersWithTotals = await getAllPartnersWithTotalQuantity()

  return partnersWithTotals.map((p) => ({
    ...p,
    discount: calculatePartnerDiscount(p.total_quantity),
  }))
}

