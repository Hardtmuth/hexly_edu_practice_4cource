import { appendFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logFilePath = join(__dirname, 'app.log')

export const logError = (context, error, extra) => {
  const timestamp = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : ''

  let line = `[${timestamp}] ${context}: ${message}`
  if (extra) {
    line += `\n  Данные: ${JSON.stringify(extra)}`
  }
  if (stack) {
    line += `\n  Stack: ${stack}`
  }
  line += '\n'

  try {
    appendFileSync(logFilePath, line, 'utf8')
  } catch (e) {
    console.error('Не удалось записать в app.log:', e.message)
  }

  console.error(line)
}
