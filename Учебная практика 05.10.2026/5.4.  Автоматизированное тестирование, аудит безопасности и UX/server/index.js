import { createApp } from './app.js'

const PORT = process.env.PORT || 3333
const HOST = process.env.HOST || '0.0.0.0'

export const start = async () => {
  const app = await createApp()

  try {
    const address = await app.listen({ port: Number(PORT), host: HOST })
    app.log.info(`Сервер запущен: ${address}`)
    return app
  } catch (error) {
    app.log.fatal(error, 'Критическая ошибка при запуске сервера')
    process.exit(1)
  }
}

start()
