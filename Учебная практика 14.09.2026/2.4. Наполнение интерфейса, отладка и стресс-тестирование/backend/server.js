import fastify from 'fastify'
import cors from '@fastify/cors'

import { getPartnersInn, getPartnerData, getPartnerTotalQuantity } from './queries.mjs'

const apiPath = '/api/v1'
const getPath = keyword => [apiPath, keyword].join('/')

const server = async () => {
  const app = fastify({
    logger: true,
  })

  await app.register(cors, {
    origin: 'http://localhost:8080'
  })

  app.get('/', () => {
    return { hello: 'world' }
  })

  app.get(getPath('inns'), async  (_, reply) => {
    const res = await getPartnersInn()
    console.log('inns is: ', res)
    reply.send(res)
  })

  app.get(getPath('totalQuantity/:partnerInn'), async (request, reply) => {
    try {
      const { partnerInn } = request.params
      const totalQuantity = await getPartnerTotalQuantity(partnerInn)
      if (!partnerInn) {
        return reply.status(404).send({ error: 'Партнер не найден' })
      }
      reply.send(totalQuantity)
    }
    catch {
      reply.status(500).send({ error: 'Ошибка сервера при получении totalQuantity' })
    }
  })

  app.get(getPath('partner/:partnerInn'), async (request, reply) => {
    try {
      const { partnerInn } = request.params
      const partnerData = await getPartnerData(partnerInn)
      console.log('partnerData is: ', partnerData)
      if (!partnerInn) {
        return reply.status(404).send({ error: 'Партнер не найден' })
      }
      reply.send(partnerData)
    }
    catch {
      reply.status(500).send({ error: 'Ошибка сервера при получении totalQuantity' })
    }
  })

  return app
}

const port = 3000

const start = async () => {
  try {
    const app = await server()

    await app.listen({
      port,
      host: 'localhost'
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()