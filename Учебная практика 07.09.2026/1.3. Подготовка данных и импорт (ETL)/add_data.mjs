import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import util from 'util'

const execPromise = util.promisify(exec) 

const red = '\x1b[41m'
const green = '\x1b[42m'
const yellow = '\x1b[43m'
const reset = '\x1b[0m'

const pgHost = process.env.PG_HOST || 'localhost'
const pgPort = process.env.PG_PORT ||  5436
const pgDb   = process.env.PG_DB   || 'practice'
const pgUser = process.env.PG_USER || 'postgres'
const pgPass = process.env.PG_PASS || 'password'

const scriptPath = fileURLToPath(import.meta.url)
const dir = path.dirname(scriptPath)
const fileNameList = fs.readdirSync(dir).filter(f => path.extname(f).toLowerCase() === '.csv')

const normalizeCsv = (csvFileNameList) => {
  console.log(`${yellow} ------- Norlamize CSV files ------- ${reset}\n`)
  csvFileNameList.forEach(file => {
    const filePath = path.join(dir, file)

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const newContent = content.replace(/\s*,\s*/g, ';')
      fs.writeFileSync(filePath, newContent, 'utf8')
      console.log(`${file} - ${green} success ${reset}`)
    } catch (e) {
      console.log(`${file} - ${red} error ${reset}`)
      console.log(e.message)
    }
  })
}

const importData = async (normalizedFileList) => {
  console.log(`\n${yellow} ------- Import data from CSV ------ ${reset}\n`)
  for(const f of normalizedFileList) {
    const table = f.split('_')[2].split('.')[0]
    const header = fs.readFileSync(f, 'utf8').split(/\r?\n/)[0].replaceAll(';', ', ')
    const filePath = path.resolve(dir, f)

    const importArgs = [
      `PGPASSWORD=${pgPass}`,
      'psql',
      `-h ${pgHost}`,
      `-p ${pgPort}`,
      `-U ${pgUser}`,
      `-d ${pgDb}`,
      '-w',
      '-c',
      `"\\COPY ${table}(${header}) FROM '${filePath}' WITH (FORMAT csv, HEADER true, DELIMITER ';')"`
    ]

    const importCmd = importArgs.join(' ')

    try {
      const { stdout } = await execPromise(importCmd)
      console.log(`${f} - ${green} success ${reset}, exec result: ${stdout.trim()}`)
    } catch (e) {
      console.log(`${red} [Error] ${reset}\n`)
      console.log(e.message)
    }
  }
}

const checkData = async (normalizedFileList) => {
  console.log(`\n${yellow} ------- Check data in tables ------ ${reset}\n`)
  for(const f of normalizedFileList) {
    const table = f.split('_')[2].split('.')[0]
    const content = fs.readFileSync(f, 'utf8')
    const dataRowsCount = content.split(/\r?\n/).length - 1

    const checkArgs = [
      `PGPASSWORD=${pgPass}`,
      'psql',
      `-h ${pgHost}`,
      `-p ${pgPort}`,
      `-U ${pgUser}`,
      `-d ${pgDb}`,
      '-w',
      '-c',
      `"SELECT COUNT(*) FROM ${table}"`
    ]

    const checkCmd = checkArgs.join(' ')

    try {
      const { stdout } = await execPromise(checkCmd)
      console.log(`${f} - ${green} success ${reset} | (rows in table '${table}': ${stdout.split(/\r?\n/)[2].trim()}, expected: ${dataRowsCount})`)
    } catch (e) {
      console.log(`${red} [Error] ${reset}\n`)
      console.log(e.message)
    }
  }
}

normalizeCsv(fileNameList)
await importData(fileNameList)
await checkData(fileNameList)
console.log(`\n${yellow} ----------------------------------- ${reset}\n`)
