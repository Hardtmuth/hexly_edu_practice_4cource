import fastify from 'fastify'
import cors from '@fastify/cors'
import { getPartnersSummary } from './answer.mjs'
import { addPartner, updatePartner, getSalesHistory, getPartner, getProduct, getProducts } from './queries.mjs'
import { calculateRawMaterial } from './calculateRawMaterial.js'
import { logError } from './logger.mjs'

const apiPath = '/api/v1'
const getPath = (keyword) => [apiPath, keyword].join('/')


const server = async () => {
  const app = fastify({ logger: true })

  await app.register(cors, {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT'],
  })

  // GET /api/v1/partners-summary
  app.get(getPath('partners-summary'), async (_, reply) => {
    try {
      const partners = await getPartnersSummary()
      reply.send(partners)
    } catch (error) {
      logError('GET /partners-summary', error)
      reply.status(500).send({ error: 'Ошибка получения данных партнёров' })
    }
  })

  // POST /api/v1/partners
  app.post(getPath('partners'), async (request, reply) => {
    const body = request.body

    if (!body || typeof body !== 'object') {
      return reply.status(400).send({ error: 'Тело запроса отсутствует или не является объектом.' })
    }

    try {
      const newPartner = await addPartner(body)
      return reply.status(201).send(newPartner)
    } catch (error) {
      if (!(error instanceof Error)) {
        logError('POST /partners — неизвестный тип ошибки', error, request.body)
        return reply.status(500).send({ error: 'Ошибка добавления партнёра' })
      }

      const message = error.message

      if (message.includes('Партнёр с таким ИНН или email уже существует.')) {
        logError('POST /partners — дубликат ИНН/email', error, request.body)
        return reply.status(409).send({ error: 'Такой ИНН или Email уже используется.' })
      }

      if (
        message.includes('обязателен') ||
        message.includes('не может быть пустым') ||
        message.includes('должен быть числом') ||
        message.includes('не может быть отрицательным')
      ) {
        logError('POST /partners — ошибка валидации', error, request.body)
        return reply.status(400).send({ error: message })
      }

      if (message.includes('duplicate key value violates unique constraint')) {
        logError('POST /partners — дубликат UNIQUE constraint', error, request.body)
        const field = message.includes('inn') ? 'ИНН' : 'Email'
        return reply.status(409).send({ error: `${field} уже существует.` })
      }

      logError('POST /partners — неожиданная ошибка', error, request.body)
      return reply.status(500).send({ error: 'Ошибка добавления партнёра' })
    }
  })

  // PUT /api/v1/partners/:partnerId
  app.put(getPath('partners/:partnerId'), async (request, reply) => {
    const { partnerId } = request.params
    const updatedData = request.body

    if (!updatedData || typeof updatedData !== 'object') {
      return reply.status(400).send({ error: 'Тело запроса пустое или не является объектом.' })
    }

    try {
      const updatedPartner = await updatePartner(partnerId, updatedData)

      if (!updatedPartner) {
        return reply.status(404).send({ error: 'Партнёр не найден.' })
      }

      reply.send(updatedPartner)
    } catch (error) {
      if (!(error instanceof Error)) {
        logError('PUT /partners/:partnerId — неизвестный тип ошибки', error, request.body)
        return reply.status(500).send({ error: 'Ошибка обновления партнёра' })
      }

      const message = error.message

      if (
        message.includes('обязателен') ||
        message.includes('не может быть пустым') ||
        message.includes('должен быть числом') ||
        message.includes('не может быть отрицательным')
      ) {
        logError('PUT /partners/:partnerId — ошибка валидации', error, request.body)
        return reply.status(400).send({ error: message })
      }

      if (
        message.includes('Партнёр с таким ИНН или email уже существует.') ||
        message.includes('duplicate key value violates unique constraint')
      ) {
        logError('PUT /partners/:partnerId — дубликат', error, request.body)
        const field = message.includes('inn') ? 'ИНН' : 'Email'
        return reply.status(409).send({ error: `${field} уже существует у другого партнёра.` })
      }

      logError('PUT /partners/:partnerId — неожиданная ошибка', error, request.body)
      return reply.status(500).send({ error: 'Ошибка обновления партнёра' })
    }
  })

  // GET /api/v1/sales-history/:partnerId
  app.get(getPath('sales-history/:partnerId'), async (request, reply) => {
    const { partnerId } = request.params

    if (typeof partnerId !== 'string' || isNaN(Number(partnerId))) {
      return reply.status(400).send({ error: 'Некорректный partnerId.' })
    }

    try {
      const history = await getSalesHistory(partnerId)
      reply.send(history)
    } catch (error) {
      logError('GET /sales-history/:partnerId', error, { partnerId })
      reply.status(500).send({ error: 'Ошибка получения данных истории продаж' })
    }
  })

  // GET /api/v1/partners/:partnerId
  app.get(getPath('partners/:partnerId'), async (request, reply) => {
    const { partnerId } = request.params

    if (typeof partnerId !== 'string' || isNaN(Number(partnerId))) {
      return reply.status(400).send({ error: 'Некорректный partnerId.' })
    }

    try {
      const partner = await getPartner(partnerId)

      if (!partner) {
        return reply.status(404).send({ error: 'Партнёр не найден.' })
      }

      reply.send(partner)
    } catch (error) {
      logError('GET /partners/:partnerId', error, { partnerId })
      reply.status(500).send({ error: 'Ошибка получения данных партнёра' })
    }
  })

  // POST /api/v1/calculate-raw-material
  app.post(getPath('calculate-raw-material'), async (request, reply) => {
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
      logError('POST /calculate-raw-material', e, request.body)
      reply.status(500).send({ result: -1, error: 'Внутренняя ошибка сервера при расчёте сырья.' })
    }
  })

  // GET /api/v1/products
  app.get(getPath('products'), async (_, reply) => {
    try {
      const list = await getProducts()
      reply.send(list)
    } catch (error) {
      logError('GET /products', error)
      reply.status(500).send({ error: 'Ошибка получения данных продуктов' })
    }
  })


  // POST /api/v1/log-client-error — для фронтенд-ошибок
  app.post(getPath('log-client-error'), async (request, reply) => {
    const { context, message, data, timestamp, userAgent } = request.body || {}

    const logContext = `CLIENT ERROR [${context || 'unknown'}]`
    const extraInfo = { message, data, timestamp, userAgent }

    logError(logContext, new Error(message || 'Unknown client error'), extraInfo)

    reply.status(204).send() // No Content — ничего не возвращаем
  })

  return app
}

const port = 3000

const start = async () => {
  try {
    const app = await server()
    await app.listen({ port, host: 'localhost' })
    app.log.info(`Сервер запущен на http://localhost:${port}`)
  } catch (error) {
    logError('Запуск сервера', error)
    process.exit(1)
  }
}

start()
