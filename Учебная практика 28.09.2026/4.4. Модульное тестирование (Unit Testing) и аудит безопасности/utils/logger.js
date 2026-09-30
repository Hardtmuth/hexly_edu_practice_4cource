import axios from 'axios'
import routes from '../routes.js'


const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data
  const safe = { ...data }
  const sensitiveKeys = ['token', 'jwt', 'password', 'secret', 'inn', 'email', 'phone']
  sensitiveKeys.forEach((key) => delete safe[key])
  return safe
};

export const sendClientErrorToServer = async ({ context, message, data }) => {
  try {
    await axios.post(routes(logsPath), {
      context,
      message,
      data: sanitizeData(data),
      timestamp: new Date().toISOString(),
      userAgent: navigator?.userAgent || 'unknown',
    })
  } catch (e) {
    console.warn('[Logger] Не удалось отправить ошибку на сервер:', e.message)
  }
}

export const logError = async (context, error, extra = {}) => {
  const msg = error instanceof Error ? error.message : String(error)
  // 1. Пишем в консоль браузера
  console.error(`[QR-STORE-FRONT] [${context}] ${msg}`, extra)
  // 2. Отправляем на сервер
  await sendClientErrorToServer({ context, message: msg, data: extra })
}
