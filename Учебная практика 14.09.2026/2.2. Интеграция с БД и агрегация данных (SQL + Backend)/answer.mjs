import { calculatePartnerDiscount } from '../2.1. Разработка ядра бизнес-логики (Расчет скидки)/business_logic.mjs'
import { getPartnersInn, getPartnerData, getPartnerTotalQuantity } from './queries.mjs'


// В задании сказано тольпо конкретному
export const getPartnerSummary = async (partnerInn) => {
  const totalQuantity = await getPartnerTotalQuantity(partnerInn)
  const partnerDiscount = calculatePartnerDiscount(totalQuantity)
  const partnerData = await getPartnerData(partnerInn)
  return { ...partnerData[0], total_quantity: totalQuantity, discount: partnerDiscount }
}

// Но можно получить сразу по всем партнерам информацию
const innList = await getPartnersInn()

export const getPartnersSummary = await Promise.all(innList.map(async i => {
  const totalQuantity = await getPartnerTotalQuantity(i)
  const partnerDiscount = calculatePartnerDiscount(totalQuantity)
  const partnerData = await getPartnerData(i)
  return { ...partnerData[0], total_quantity: totalQuantity, discount: partnerDiscount }
}))