import fastify from 'fastify'
import cors from '@fastify/cors'
import { getPartnersSummary } from './answer.mjs'
import { addPartner, updatePartner } from './queries.mjs'

const apiPath = '/api/v1'
const getPath = (keyword) => [apiPath, keyword].join('/')

const server = async () => {
  const app = fastify({ logger: true })

  await app.register(cors, {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT'],
  })

  app.get(getPath('partners-summary'), async (_, reply) => {
    try {
      const partners = await getPartnersSummary()
      reply.send(partners)
    } catch {
      reply.status(500).send({ error: 'Ошибка получения данных партнёров' })
    }
  })

  app.post(getPath('partners'), async (request, reply) => {
    try {
      const partnerData = request.body
      console.log('[SERVER] add partner inbound: ', partnerData)
      if (!partnerData || !partnerData.inn) {
        reply.status(400).send({ error: 'Некорректные данные партнёра' })
        return
      }
      const newPartner = await addPartner(partnerData)
      reply.status(201).send(newPartner)
    } catch (error) {
      console.error('Ошибка добавления партнёра:', error)
      reply.status(500).send({ error: 'Ошибка добавления партнёра' })
    }
  })

  app.put(getPath('partners/:partnerId'), async (request, reply) => {
    try {
      const { partnerId } = request.params
      const updatedData = request.body
      console.log('[SERVER] update partner inbound: ', partnerId, updatedData)
      if (!updatedData) {
        reply.status(400).send({ error: 'Некорректные данные для обновления' })
        return
      }
      const updatedPartner = await updatePartner(partnerId, updatedData)
      reply.send(updatedPartner)
    } catch (error) {
      console.error('Ошибка обновления партнёра:', error)
      reply.status(500).send({ error: 'Ошибка обновления партнёра' })
    }
  })

  return app
}

const port = 3000

const start = async () => {
  try {
    const app = await server()
    await app.listen({ port, host: 'localhost' })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()
