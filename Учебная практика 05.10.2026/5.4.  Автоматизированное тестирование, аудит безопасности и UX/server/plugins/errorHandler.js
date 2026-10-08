import fp from 'fastify-plugin'

const errorHandlerPlugin = async (app) => {
  app.setErrorHandler((error, request, reply) => {
    // Ошибка валидации JSON Schema
    if (error.validation) {
      return reply.code(400).send({
        error: 'VALIDATION_ERROR',
        message: `Поле "${error.validation[0]?.instancePath || error.validation[0]?.params?.missingProperty}": ${error.validation[0]?.message}`,
        details: error.validation,
      })
    }

    // Ошибка БД: unique_violation
    if (error.code === '23505') {
      return reply.code(409).send({
        error: 'DUPLICATE_ENTRY',
        message: 'Запись с таким значением уже существует',
      })
    }

    // Ошибка БД: foreign_key_violation
    if (error.code === '23503') {
      return reply.code(400).send({
        error: 'FOREIGN_KEY_VIOLATION',
        message: 'Связанная запись не найдена',
      })
    }

    // Ошибка БД: not_null_violation
    if (error.code === '23502') {
      return reply.code(400).send({
        error: 'MISSING_REQUIRED_FIELD',
        message: 'Отсутствует обязательное поле',
      })
    }

    // Кастомные ошибки приложения (с statusCode)
    if (error.statusCode) {
      return reply.code(error.statusCode).send({
        error: error.code || 'APP_ERROR',
        message: error.message,
      })
    }

    // Всё остальное — 500
    request.log.error(error)
    reply.code(500).send({
      error: 'INTERNAL_ERROR',
      message: 'Внутренняя ошибка сервера',
    })
  })
}

export default fp(errorHandlerPlugin)
