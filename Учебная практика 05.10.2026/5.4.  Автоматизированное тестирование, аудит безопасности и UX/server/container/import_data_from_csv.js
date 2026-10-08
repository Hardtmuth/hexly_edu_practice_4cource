import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import util from 'util'

const execFilePromise = util.promisify(execFile)

const c = {
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m', reset: '\x1b[0m',
}

const icons = {
  success: '✔',
  error: '✖',
  warn: '⚠',
}

const pgEnv = {
  ...process.env,
  PGPASSWORD: process.env.PG_PASS || 'password',
  PGHOST: process.env.PG_HOST     || 'localhost',
  PGPORT: process.env.PG_PORT     ||  5438,
  PGDATABASE: process.env.PG_DB   || 'practice5',
  PGUSER: process.env.PG_USER     || 'postgres',
}

const scriptPath = fileURLToPath(import.meta.url)
const dir = path.join(path.dirname(scriptPath), 'import')
const fileNameList = fs.readdirSync(dir)
  .filter(f => path.extname(f).toLowerCase() === '.csv')
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

if (fileNameList.length === 0) {
  console.log(`${c.yellow}CSV файлы не найдены в директории.${c.reset}`)
  process.exit(0)
}

const getFileMetadata = async (file) => {
  const filePath = path.join(dir, file)
  const table = path.parse(file).name.replace(/^\d+_\s*/, '')

  // Читаем файл и разбиваем на строки
  const content = await fs.promises.readFile(filePath, 'utf8')
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  const header = lines[0].replaceAll(';', ', ')
  const rowsCount = lines.length - 1

  return { table, header, rowsCount, filePath }
}

const importData = async (csvFiles) => {
  console.log(`\n${c.bold}${c.yellow}=== 1. IMPORT DATA TO POSTGRES ===${c.reset}\n`)

  const maxFileLen = Math.max(...csvFiles.map(f => f.length))

  for (const f of csvFiles) {
    try {
      const { table, header, filePath } = await getFileMetadata(f)
      const copyCmd = `\\COPY ${table}(${header}) FROM '${filePath}' WITH (FORMAT csv, HEADER true, DELIMITER ';')`

      const { stdout } = await execFilePromise('psql', ['-w', '-c', copyCmd], { env: pgEnv })

      const paddedFile = f.padEnd(maxFileLen)
      const paddedTable = table.padEnd(15)

      console.log(`${c.green}${icons.success}${c.reset} ${paddedFile} ${c.gray}→${c.reset} Table: ${c.cyan}${paddedTable}${c.reset} | ${c.green}${stdout.trim() || 'COPY SUCCESS'}${c.reset}`)
    } catch (e) {
      const paddedFile = f.padEnd(maxFileLen)
      console.log(`${c.red}${icons.error}${c.reset} ${paddedFile} ${c.red}[Import Error]${c.reset}`)
      console.log(`${c.gray}${e.message}${c.reset}`)
    }
  }
}


const checkData = async (csvFiles) => {
  console.log(`\n${c.bold}${c.yellow}=== 2. DATA VERIFICATION REPORT ===${c.reset}\n`)

  const reportData = {}

  for (const f of csvFiles) {
    try {
      const { table, rowsCount: expectedRows } = await getFileMetadata(f)

      const { stdout } = await execFilePromise(
        'psql',
        ['-w', '-t', '-A', '-c', `SELECT COUNT(*) FROM ${table}`],
        { env: pgEnv }
      )

      const dbCount = parseInt(stdout.trim(), 10)
      const isSuccess = !isNaN(dbCount) && dbCount === expectedRows

      reportData[f] = {
        'Table': table,
        'Expected': expectedRows,
        'In DB': isNaN(dbCount) ? 'Error' : dbCount,
        'Status': isSuccess ? `${icons.success} Success` : `${icons.error} Mismatch`,
      }
    } catch (e) {
      reportData[f] = {
        'Table': 'Error',
        'Expected': 0,
        'In DB': 'Error',
        'Status': `${icons.warn} Error`,
      }
    }
  }

  console.table(reportData, ['Table', 'Expected', 'In DB', 'Status'])
}


await importData(fileNameList)
await checkData(fileNameList)
