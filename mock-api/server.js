/**
 * Mock API (json-server 0.17) com alguns comportamentos a mais:
 *
 * - O banco é recriado a partir de db.seed.json a cada start (db.json não é versionado).
 * - Porta lida de --port ou da variável PORT (padrão 3333), para rodar em Render, Railway, Fly etc.
 * - Atraso de rede simulado: --delay <ms> ou DELAY (padrão 300). Por requisição: ?_delay=2000.
 * - Falhas simuladas: --fail-rate 0.2 ou FAIL_RATE=0.2 faz ~20% das requisições responderem 500.
 *   Por requisição: ?_fail=1 força um 500.
 * - /suggestions?q= ignora acentos ("sao" encontra "São Paulo").
 *
 * Uso: node server.js [--port 3333] [--host 0.0.0.0] [--delay 300] [--fail-rate 0]
 */
const fs = require('fs')
const path = require('path')
const jsonServer = require('json-server')

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

const port = Number(arg('port') ?? process.env.PORT ?? 3333)
const host = arg('host') ?? process.env.HOST ?? 'localhost'
const delay = Number(arg('delay') ?? process.env.DELAY ?? 300)
const failRate = Number(arg('fail-rate') ?? process.env.FAIL_RATE ?? 0)

function resolveSeed() {
  const candidates = [
    path.join(__dirname, 'db.seed.json'),
    path.join(process.cwd(), 'db.seed.json'),
    path.join(__dirname, 'db.json'),
    path.join(process.cwd(), 'db.json'),
  ]
  const found = candidates.find(
    (file) => fs.existsSync(file) && fs.statSync(file).size > 2,
  )
  if (!found) {
    throw new Error(
      `Banco da mock-api não encontrado. Tentativas: ${candidates.join(', ')}`,
    )
  }
  return found
}

const seedFile = resolveSeed()
const dbFile = process.env.VERCEL
  ? path.join('/tmp', 'db.json')
  : path.join(__dirname, 'db.json')
const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'))
fs.writeFileSync(dbFile, JSON.stringify(seed))

const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const server = jsonServer.create()
server.use(jsonServer.defaults())

server.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next()

  const requestDelay = req.query._delay !== undefined ? Number(req.query._delay) : delay
  const forceFail = req.query._fail !== undefined
  delete req.query._delay
  delete req.query._fail

  if (req.path === '/suggestions' && typeof req.query.q === 'string') {
    req.query.q = stripAccents(req.query.q)
  }

  setTimeout(() => {
    if (forceFail || (failRate > 0 && Math.random() < failRate)) {
      res.status(500).json({ error: 'Falha simulada pela mock API' })
      return
    }
    next()
  }, requestDelay)
})

server.use(jsonServer.router(seed))

if (!process.env.VERCEL) {
  server.listen(port, host, () => {
    console.log(`Mock API em http://${host}:${port} (delay ${delay}ms, fail-rate ${failRate})`)
  })
}

module.exports = server
