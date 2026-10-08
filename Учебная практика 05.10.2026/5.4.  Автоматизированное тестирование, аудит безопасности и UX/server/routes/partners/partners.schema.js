export const createPartnerSchema = {
  type: 'object',
  required: ['partner_name', 'legal_form', 'inn','email'],
  properties: {
    legal_form : { type: 'string', enum: ['ООО', 'ИП', 'АО', 'ЗАО'] },
    partner_name: { type: 'string', minLength: 2, maxLength: 100 },
    inn: { type: 'string', minLength: 10, maxLength: 12 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', maxLength: 20 },
    address: { type: 'string', maxLength: 255 },
    director_name: { type: 'string', minLength: 2, maxLength: 255 },
    rating: { type: 'integer', minimum: 1, maximum: 5 },
  },
}

export const updatePartnerSchema = {
  type: 'object',
  properties: {
    legal_form : { type: 'string', enum: ['ООО', 'ИП', 'АО', 'ЗАО'] },
    partner_name: { type: 'string', minLength: 2, maxLength: 100 },
    inn: { type: 'string', minLength: 10, maxLength: 12 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', maxLength: 20 },
    address: { type: 'string', maxLength: 255 },
    director_name: { type: 'string', minLength: 2, maxLength: 255 },
    rating: { type: 'integer', minimum: 1, maximum: 5 },
  },
  minProperties: 1,
}

export const getPartnersQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', default: 1, minimum: 1 },
    limit: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
    search: { type: 'string', maxLength: 50 },
  },
}

export const partnerIdParamsSchema = {
  type: 'object',
  properties: {
    partnerId: { type: 'string', pattern: '^[0-9]+$' },
  },
  required: ['partnerId'],
}
