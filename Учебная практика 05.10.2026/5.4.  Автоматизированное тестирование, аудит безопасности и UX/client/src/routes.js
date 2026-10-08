// const apiPath = 'api/v1'
export const SERVER = 'http://localhost:3333'

export default {
  partnersSummaryPath: () => [SERVER, 'partners-summary'].join('/'),
  partnersPath: () => [SERVER, 'partners'].join('/'),
  partnerPath: (partnerId) => [SERVER, 'partners', partnerId].join('/'),
  salesHistoryPath: (partnerId) => [SERVER, 'sales-history', partnerId].join('/'),
  calculateRawMaterial: () => [SERVER, 'calculate-raw-material'].join('/'),
  productsPath: () => [SERVER, 'products'].join('/'),
  logsPath: () => [SERVER, 'log-client-error'].join('/')
}
