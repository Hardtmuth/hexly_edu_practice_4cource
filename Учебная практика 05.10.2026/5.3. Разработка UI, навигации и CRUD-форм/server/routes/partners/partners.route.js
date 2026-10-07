import { createPartnerSchema, updatePartnerSchema, getPartnersQuerySchema, partnerIdParamsSchema } from './partners.schema.js'
import * as partnerService from './partners.service.js'

export default  (fastify, opts, done) => {
  // Создание партнёра
  fastify.post('/partners', {
    schema: { body: createPartnerSchema },
    handler: async (request, reply) => {
      try {
        const partner = await partnerService.createPartner(request.body)
        return reply.status(201).send(partner)
      } catch (err) {
        // Обработка ошибки уникальности (email уже есть)
        if (err.code === '23505') {
          return reply.status(409).send({ error: 'Партнёр с таким email уже существует' })
        }
        throw err
      }
    },
  })

  // Список партнёров (пагинация + поиск)
  fastify.get('/partners', {
    schema: { querystring: getPartnersQuerySchema },
    handler: async (request, reply) => {
      const { page = 1, limit = 20, search = '' } = request.query
      return partnerService.getPartners(page, limit, search ? search.trim() : null)
    },
  })

  // Получение одного партнёра
  fastify.get('/partners/:partnerId', {
    schema: { params: partnerIdParamsSchema },
    handler: async (request, reply) => {
      const id = parseInt(request.params.partnerId, 10)
      if (Number.isNaN(id)) {
        return reply.status(400).send({ error: 'Некорректный ID партнёра' })
      }

      const partner = await partnerService.getPartnerById(id)
      if (!partner) {
        return reply.status(404).send({ error: 'Партнёр не найден' })
      }
      return partner
    },
  })

  // Обновление партнёра
  fastify.put('/partners/:partnerId', {
    schema: { params: partnerIdParamsSchema, body: updatePartnerSchema },
    handler: async (request, reply) => {
      const { partnerId } = request.params
      const updatedData = request.body

      if (!updatedData || typeof updatedData !== 'object') {
        return reply.status(400).send({ error: 'Тело запроса пустое или не является объектом.' })
      }

      try {
        const updatedPartner = await partnerService.updatePartner(partnerId, updatedData)

        if (!updatedPartner) {
          return reply.status(404).send({ error: 'Партнёр не найден.' })
        }

        reply.send(updatedPartner)
      }  catch (error) {
        if (!(error instanceof Error)) {
          console.error('PUT /partners/:partnerId — неизвестный тип ошибки', error, request.body)
          return reply.status(500).send({ error: 'Ошибка обновления партнёра' })
        }

        const message = error.message

        if (
          message.includes('обязателен') ||
          message.includes('не может быть пустым') ||
          message.includes('должен быть числом') ||
          message.includes('не может быть отрицательным')
        ) {
          console.error('PUT /partners/:partnerId — ошибка валидации', error, request.body)
          return reply.status(400).send({ error: message })
        }

        if (
          message.includes('Партнёр с таким ИНН или email уже существует.') ||
          message.includes('duplicate key value violates unique constraint')
        ) {
          console.error('PUT /partners/:partnerId — дубликат', error, request.body)
          const field = message.includes('inn') ? 'ИНН' : 'Email'
          return reply.status(409).send({ error: `${field} уже существует у другого партнёра.` })
        }

        console.error('PUT /partners/:partnerId — неожиданная ошибка', error, request.body)
        return reply.status(500).send({ error: 'Ошибка обновления партнёра' })
      }
    }
  })

  // Удаление партнёра
  fastify.delete('/partners/:partnerId', {
    schema: { params: partnerIdParamsSchema },
    handler: async (request, reply) => {
      const id = parseInt(request.params.partnerId, 10)
      if (Number.isNaN(id)) {
        return reply.status(400).send({ error: 'Некорректный ID партнёра' })
      }

      await partnerService.deletePartner(id)
      return reply.status(204).send()
    },
  })

  // GET /api/v1/sales-history/:partnerId
  fastify.get('/sales-history/:partnerId', {
    schema: { params: partnerIdParamsSchema },
    handler: async (request, reply) => {
      const { partnerId } = request.params

      /* if (typeof partnerId !== 'string' || isNaN(Number(partnerId))) {
        return reply.status(400).send({ error: 'Некорректный partnerId.' })
      } */

      try {
        const history = await partnerService.getSalesHistory(partnerId)
        reply.send(history)
      } catch (error) {
        // console.error('GET /sales-history/:partnerId', error, { partnerId })
        reply.status(500).send({ error: 'Ошибка получения данных истории продаж' })
      }
    },
  })

  // GET /api/v1/partners-summary
  fastify.get('/partners-summary', {
    handler: async (_, reply) => {
      try {
        const partners = await partnerService.getPartnersSummary()
        reply.send(partners)
      } catch (error) {
        // console.error('GET /partners-summary', error)
        reply.status(500).send({ error: 'Ошибка получения данных партнёров' })
      }
    },
  })

  done()
}
