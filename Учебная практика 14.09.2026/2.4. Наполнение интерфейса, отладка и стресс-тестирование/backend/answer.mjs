import { calculatePartnerDiscount } from './business_logic.mjs'
import routes from '../routes.js'

const getInns = async () => {
  const response = await fetch(routes.innsPath())
  const innList = await response.json()
  return innList
}

const getPartnerTotalQuantity = async (partnerInn) => {
  const response = await fetch(routes.totalQuantityPath(partnerInn))
  const partnerTotalQuantity = await response.json()
  // console.log('partnerTotalQuantity is: ', partnerTotalQuantity)
  return partnerTotalQuantity
}

const getPartnerData = async (partnerInn) => {
  const response = await fetch(routes.partnerDataPath(partnerInn))
  const partnerData = await response.json()
  // console.log('partnerData is: ', partnerData)
  return partnerData
}

export const getPartnersSummary = async () => {
  const innList = await getInns()
  if (!innList || innList.length === 0) {
    return []
  }
  const summaries = await Promise.all(
    innList.map(async i => {
      const totalQuantity = await getPartnerTotalQuantity(i)
      const partnerDiscount = calculatePartnerDiscount(totalQuantity)
      const partnerData = await getPartnerData(i)
      const partnerSummary = {
        ...partnerData[0],
        total_quantity: totalQuantity,
        discount: partnerDiscount 
      }
      // console.log('partnerSummary is: ', partnerSummary)
      return partnerSummary
    })
  )
  return summaries
}