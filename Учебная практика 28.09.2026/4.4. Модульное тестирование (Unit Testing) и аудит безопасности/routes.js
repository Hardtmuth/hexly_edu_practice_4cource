import { calculateRawMaterial } from "../4.2. Разработка ядра алгоритма расчета материалов/calculateRawMaterial"

const apiPath = 'api/v1'
export const SERVER = 'http://localhost:3000'

export default {
  partnersSummaryPath: () => [SERVER, apiPath, 'partners-summary'].join('/'),
  partnersPath: () => [SERVER, apiPath, 'partners'].join('/'),
  partnerPath: (partnerId) => [SERVER, apiPath, 'partners', partnerId].join('/'),
  salesHistoryPath: (partnerId) => [SERVER, apiPath, 'sales-history', partnerId].join('/'),
  calculateRawMaterial: () => [SERVER, apiPath, 'calculate-raw-material'].join('/'),
  productsPath: () => [SERVER, apiPath, 'products'].join('/'),
  logsPath: () => [SERVER, apiPath, 'log-client-error'].join('/')
}
