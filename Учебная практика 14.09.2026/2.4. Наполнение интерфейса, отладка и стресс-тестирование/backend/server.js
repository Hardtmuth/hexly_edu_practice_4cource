import fastify from 'fastify'
import cors from '@fastify/cors'
import { getPartnersSummary } from './answer.mjs'

const apiPath = '/api/v1'
const getPath = (keyword) => [apiPath, keyword].join('/')

const server = async () => {
  const app = fastify({ logger: true })

  await app.register(cors, {
    origin: 'http://localhost:8080',
  })

  app.get(getPath('partners-summary'), async (_, reply) => {
    try {
      const partners = await getPartnersSummary()
      reply.send(partners)
    } catch {
      reply.status(500).send({ error: 'Ошибка получения данных партнёров' })
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
