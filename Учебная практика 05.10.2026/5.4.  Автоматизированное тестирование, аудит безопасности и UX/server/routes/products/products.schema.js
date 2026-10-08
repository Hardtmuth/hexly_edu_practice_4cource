export const calculateRawMaterialSchema = {
  type: 'object',
  required: ['productId', 'quantity', 'param1', 'param2'],
  properties: {
    productId: { type: 'string' },
    quantity: { type: 'number' },
    param1: { type: 'number' },
    param2: { type: 'number' }
  },
}
