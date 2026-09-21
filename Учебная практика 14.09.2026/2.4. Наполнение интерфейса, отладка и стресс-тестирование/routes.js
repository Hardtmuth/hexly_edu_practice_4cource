const apiPath = 'api/v1'
export const SERVER = 'http://localhost:3000'

export default {
  partnersSummaryPath: () => [SERVER, apiPath, 'partners-summary'].join('/'),
}
