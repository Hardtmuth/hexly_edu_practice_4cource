import fastify from 'fastify'
import cors from '@fastify/cors'
import dbPlugin from './plugins/db.js'
import routes from './plugins/routes.js'

const loggerConfig = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:HH:MM:ss',
      ignore: 'pid,hostname',
      colorize: true,
      levelFirst: true,
    },
  },
}

export const createApp = async () => {
  const app = fastify({ logger: loggerConfig })

  await app.register(cors, {
    origin: 'http://localhost:8088',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })

  await app.register(dbPlugin)
  await app.register(routes)

  return app
}
