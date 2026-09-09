import { exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const pgHost = process.env.PG_HOST || 'localhost'
const pgPort = process.env.PG_PORT ||  5436
const pgDb   = process.env.PG_DB   || 'practice'
const pgUser = process.env.PG_USER || 'postrges'
const pgPass = process.env.PG_PASS || 'password'

const scriptPath = fileURLToPath(import.meta.url)
const csvPath = path.resolve(path.dirname(scriptPath), '../for_check/products.csv')
console.log('Path to CSV: ', csvPath)


const args = [
  `PGPASSWORD=${pgPass}`,
  'psql',
  `-h ${pgHost}`,
  `-p ${pgPort}`,
  `-U ${pgUser}`,
  `-d ${pgDb}`,
  '-w',
  '-c',
  `"\\copy products(product_name, sku, stock, price) FROM '${csvPath}' WITH (FORMAT csv, HEADER true, DELIMITER ';')"`
]

const cmd = args.join(' ')

console.log('CMD is: ', cmd)

exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error.message)
    if (stderr) console.error(stderr)
    return
  }
  console.log('Success:', stdout)
})