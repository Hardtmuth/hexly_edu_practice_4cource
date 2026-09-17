const apiPath = 'api/v1'
export const SERVER = 'http://localhost:3000'

export default {
  innsPath: () => [SERVER, apiPath, 'inns'].join('/'),
  totalQuantityPath: partnerInn => [SERVER, apiPath, 'totalQuantity', partnerInn].join('/'),
  partnerDataPath: partnerInn => [SERVER, apiPath, 'partner', partnerInn].join('/')
}