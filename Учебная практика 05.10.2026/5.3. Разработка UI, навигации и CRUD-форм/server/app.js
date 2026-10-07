import fastify from 'fastify'
import cors from '@fastify/cors'
import dbPlugin from './plugins/db.js'
import errorHandlerPlugin from './plugins/errorHandler.js'
import routes from './routes/index.js'
import partnersRoutes from './routes/partners/partners.route.js'
import productsRoutes from './routes/products/products.route.js'

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
  await app.register(errorHandlerPlugin)
  await app.register(routes)
  await app.register(partnersRoutes)
  await app.register(productsRoutes)

  return app
}
