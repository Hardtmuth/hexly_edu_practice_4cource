import { calculateRawMaterialSchema } from './products.schema.js'
import { getProduct, getProducts, calculateRawMaterial } from './products.service.js'

export default (fastify, opts, done) => {
  // POST /api/v1/calculate-raw-material
  fastify.post('/calculate-raw-material', {
    schema: { body: calculateRawMaterialSchema },
    handler: async (request, reply) => {
      const { productId, quantity, param1, param2 } = request.body || {}

      if (typeof productId === 'undefined' || productId === null) {
        return reply.status(400).send({ result: -1, error: 'productId обязателен.' })
      }

      const qty = Number(quantity)
      const p1 = Number(param1)
      const p2 = Number(param2)

      if (!Number.isFinite(qty) || !Number.isFinite(p1) || !Number.isFinite(p2)) {
        return reply.status(400).send({ result: -1, error: 'quantity, param1 и param2 должны быть корректными числами.' })
      }

      try {
        const productData = await getProduct(productId)

        if (!productData) {
          return reply.status(404).send({ result: -1, error: 'Продукт не найден.' })
        }

        const { product_type_id, material_type_id } = productData

        const result = await calculateRawMaterial(
          product_type_id,
          material_type_id,
          qty,
          p1,
          p2
        )

        if (result === -1) {
          return reply.status(400).send({ result: -1, error: 'Некорректные данные для расчёта сырья.' })
        }

        reply.send({ result, error: null })
      } catch (e) {
        // logError('POST /calculate-raw-material', e, request.body)
        reply.status(500).send({ result: -1, error: 'Внутренняя ошибка сервера при расчёте сырья.' })
      }
    },
  })

  // GET /api/v1/products
  fastify.get('/products', {
    handler: async (_, reply) => {
      try {
        const list = await getProducts()
        reply.send(list)
      } catch (error) {
        //logError('GET /products', error)
        reply.status(500).send({ error: 'Ошибка получения данных продуктов' })
      }
    },
  })

  done()
}
