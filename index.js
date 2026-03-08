// index.js - Núcleo de Eris Bot (corregido: carga recursiva de plugins con lib/plugins-loader.js)
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch as fsWatch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import { checkCodesEndpoint } from './lib/apiChecker.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import boxen from 'boxen'
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import store from './lib/store.js'
import initPlugins from './lib/plugins-loader.js' // loader recursivo de plugins

const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')

import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

// helper
let { say } = cfonts

// Banner de inicio (colores y formato solicitado)
const title = 'E R I S  B O T'
const coloredTitle = title.split('').map((ch, i) => {
  if (ch === ' ') return ' '
  return (i % 2 === 0) ? chalk.cyanBright(ch) : chalk.magentaBright(ch)
}).join('')

console.log('\n' + coloredTitle)
console.log(chalk.gray('────────────────────────────────\n'))
console.log(chalk.yellow('Sistema      :') + ' ' + chalk.green('WhatsApp Automation'))
console.log(chalk.yellow('Developer    :') + ' ' + chalk.green('Nevi-dev'))
console.log(chalk.yellow('Runtime      :') + ' ' + chalk.green('NodeJS'))
console.log(chalk.yellow('Engine       :') + ' ' + chalk.green('Baileys MD'))
console.log('\n' + chalk.gray('────────────────────────────────') + '\n')
console.log(chalk.cyanBright('Inicializando núcleo...'))
console.log(chalk.cyanBright('Cargando plugins...'))
console.log(chalk.cyanBright('Preparando conexión WhatsApp...'))

// cfonts fallback (no crítico)
try {
  cfonts.say('Eris Bot', {
    font: 'chrome',
    align: 'center',
    gradient: ['#00FFFF', '#8A2BE2'],
    transition: true,
    env: 'node'
  })
} catch (e) { /* no crítico */ }

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

global.timestamp = { start: new Date() }

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#/!.]')

// Inicializar DB (lowdb por defecto)
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('./src/database/database.json'))

global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function () {
      if (!global.db.READ) {
        clearInterval(this)
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
      }
    }, 1 * 1000))
  }
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = chain(global.db.data)
}
await global.loadDatabase()

// Auth state (multi-file)
const { state, saveState, saveCreds } = await useMultiFileAuthState(global.Ellensessions)
const msgRetryCounterMap = (MessageRetryMap) => { }
const msgRetryCounterCache = new NodeCache()
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber

const methodCodeQR = process.argv.includes('qr')
const methodCode = !!phoneNumber || process.argv.includes('code')
const MethodMobile = process.argv.includes('mobile')
const colores = chalk.bgCyan.black
const opcionQR = chalk.bold.green
const opcionTexto = chalk.bold.blue
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion
if (methodCodeQR) opcion = '1'

if (!methodCodeQR && !methodCode && !fs.existsSync(`./${Ellensessions}/creds.json`)) {
  do {
    opcion = await question(colores('⌨ Seleccione una opción:\n') + opcionQR('1. Con código QR\n') + opcionTexto('2. Con código de texto de 8 dígitos\n--> '))
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright('✦ Solo se permiten los números 1 o 2. No se admiten letras ni símbolos especiales.'))
    }
  } while ((opcion !== '1' && opcion !== '2') || fs.existsSync(`./${Ellensessions}/creds.json`))
}

console.info = () => {}
console.debug = () => {}

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: opcion == '1' ? [`${nameqr}`, 'Edge', '20.0.04'] : methodCodeQR ? [`${nameqr}`, 'Edge', '20.0.04'] : ['Ubuntu', 'Edge', '110.0.1587.56'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: 'fatal' }).child({ level: 'fatal' }))
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  getMessage: async (clave) => {
    let jid = jidNormalizedUser(clave.remoteJid)
    let msg = await store.loadMessage(jid, clave.id)
    return msg?.message || ''
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  version
}

global.conn = makeWASocket(connectionOptions)

// Si no existen credenciales, preparar pairing (QR o code)
if (!fs.existsSync(`./${Ellensessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    if (!global.conn.authState?.creds?.registered) {
      let addNumber
      if (!!phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '')
      } else {
        do {
          phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright('✦ Por favor, ingrese el número de WhatsApp.\n') + chalk.bold.yellowBright('✏️  Ejemplo: 1234567890') + chalk.bold.magentaBright('\n---\u003e ')))
          phoneNumber = phoneNumber.replace(/\D/g, '')
          if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`
        } while (!await isValidPhoneNumber(phoneNumber))
        rl.close()
        addNumber = phoneNumber.replace(/\D/g, '')
        setTimeout(async () => {
          let codeBot = await global.conn.requestPairingCode(addNumber)
          codeBot = codeBot?.match(/.{1,4}/g)?.join('-') || codeBot
          console.log(chalk.bold.white(chalk.bgMagenta('✧ CÓDIGO DE VINCULACIÓN ✧')), chalk.bold.white(chalk.white(codeBot)))
        }, 3000)
      }
    }
  }
}

global.conn.isInit = false
global.conn.well = false

if (!opts['test']) {
  if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
    if (opts['autocleartmp'] && (global.support || {}).find) {
      const tmp = [tmpdir(), 'tmp']
      tmp.forEach((filename) => spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']))
    }
  }, 30 * 1000)
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update
  global.stopped = connection
  if (isNewLogin) global.conn.isInit = true
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
  if (code && code !== DisconnectReason.loggedOut && global.conn?.ws?.socket == null) {
    await global.reloadHandler(true).catch(console.error)
    global.timestamp.connect = new Date()
  }
  if (global.db.data == null) await global.loadDatabase()
  if ((update.qr != 0 && update.qr != undefined) || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.bold.yellow('\n❐ ESCANEA EL CÓDIGO QR, EXPIRA EN 45 SEGUNDOS'))
    }
  }
  if (connection == 'open') {
    console.log(chalk.bold.green('\n❀ Eris-Bot Conectado Exitosamente ❀'))
  }

  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      console.log(chalk.bold.cyanBright(`\n⚠️ SIN CONEXIÓN, BORRE LA CARPETA ${global.Ellensessions} Y ESCANEE EL CÓDIGO QR ⚠️`))
    } else if (reason === DisconnectReason.connectionClosed) {
      console.log(chalk.bold.magentaBright('\n╭─ CONEXIÓN CERRADA, RECONECTANDO....\n'))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.connectionLost) {
      console.log(chalk.bold.blueBright('\n╭─ CONEXIÓN PERDIDA CON EL SERVIDOR, RECONECTANDO....\n'))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.connectionReplaced) {
      console.log(chalk.bold.yellowBright('\n╭─ CONEXIÓN REEMPLAZADA, SE HA ABIERTO OTRA NUEVA SESIÓN, POR FAVOR, CIERRE LA SESIÓN ACTUAL.\n'))
    } else if (reason === DisconnectReason.loggedOut) {
      console.log(chalk.bold.redBright(`\n⚠️ SIN CONEXIÓN, BORRE LA CARPETA ${global.Ellensessions} Y ESCANEE EL CÓDIGO QR ⚠️`))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.restartRequired) {
      console.log(chalk.bold.cyanBright('\n╭─ ✧ CONECTANDO AL SERVIDOR...\n'))
      await global.reloadHandler(true).catch(console.error)
    } else if (reason === DisconnectReason.timedOut) {
      console.log(chalk.bold.yellowBright('\n╭─ ⧖ TIEMPO DE CONEXIÓN AGOTADO, RECONECTANDO....\n'))
      await global.reloadHandler(true).catch(console.error)
    } else {
      console.log(chalk.bold.redBright(`\n⚠️ RAZÓN DE DESCONEXIÓN DESCONOCIDA: ${reason || 'No Encontrado'} >> ${connection || 'No Encontrado'}`))
    }
  }
}

// Manejar excepciones globales
process.on('uncaughtException', console.error)

// Cargar handler y exponer reloadHandler
let isInit = true
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try { global.conn.ws.close() } catch {}
    try { global.conn.ev.removeAllListeners() } catch {}
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if (!isInit) {
    try {
      global.conn.ev.off('messages.upsert', global.conn.handler)
      global.conn.ev.off('connection.update', global.conn.connectionUpdate)
      global.conn.ev.off('creds.update', global.conn.credsUpdate)
    } catch {}
  }

  global.conn.handler = handler.handler.bind(global.conn)

  global.dispatchCommandFromButton = async (fakeMessage) => {
    try { await handler.handler.call(global.conn, { messages: [fakeMessage] }) } catch (err) { console.error('Error al ejecutar comando desde botón:', err) }
  }
  global.conn.connectionUpdate = connectionUpdate.bind(global.conn)
  global.conn.credsUpdate = saveCreds.bind(global.conn, true)

  // reconectar chats if needed (kept safe)
  try {
    const currentDateTime = new Date()
    const messageDateTime = new Date(global.conn.ev)
    if (currentDateTime >= messageDateTime) {
      const chats = Object.entries(global.conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
    } else {
      const chats = Object.entries(global.conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
    }
  } catch {}

  global.conn.ev.on('messages.upsert', global.conn.handler)
  global.conn.ev.on('connection.update', global.conn.connectionUpdate)
  global.conn.ev.on('creds.update', global.conn.credsUpdate)
  isInit = false
  return true
}

// Plugins: usar loader recursivo (lib/plugins-loader.js)
const pluginFolder = join(__dirname, './plugins')
try {
  await initPlugins(pluginFolder) // carga recursiva y establece global.reload + watchers
} catch (e) {
  console.error('Error inicializando plugins:', e)
}
// Llamar reloadHandler una vez los plugins estén cargados
await global.reloadHandler()

// quick test / soporte de binarios
async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version'])
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => { resolve(code !== 127) })
      }),
      new Promise((resolve) => { p.on('error', (_) => resolve(false)) })
    ])
  }))
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find }
  Object.freeze(global.support)
}
_quickTest().then(() => {
  try { global.conn.logger.info(chalk.bold('✦  H E C H O')) } catch {}
}).catch(console.error)

function clearTmp() {
  try {
    const tmpDir = join(__dirname, 'tmp')
    if (!fs.existsSync(tmpDir)) return
    const filenames = readdirSync(tmpDir)
    filenames.forEach(file => {
      const filePath = join(tmpDir, file)
      try { unlinkSync(filePath) } catch {}
    })
  } catch (e) { console.error(e) }
}

function purgeEllenSession() {
  try {
    let prekey = []
    let directorio = readdirSync(`./${Ellensessions}`)
    let filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'))
    prekey = [...prekey, ...filesFolderPreKeys]
    filesFolderPreKeys.forEach(files => {
      try { unlinkSync(`./${Ellensessions}/${files}`) } catch {}
    })
  } catch (e) { /* ignore */ }
}

function purgeOldFiles() {
  try {
    const directories = [`./${Ellensessions}/`]
    directories.forEach(dir => {
      try {
        const files = readdirSync(dir)
        files.forEach(file => {
          if (file !== 'creds.json') {
            const filePath = path.join(dir, file)
            try { unlinkSync(filePath) } catch (err) {
              console.log(chalk.bold.red(`\n╭» ❍ ARCHIVO ❍\n│→ ${file} NO SE LOGRÓ BORRAR\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ✘\n` + err))
            }
          }
        })
      } catch {}
    })
  } catch {}
}

function redefineConsoleMethod(methodName, filterStrings) {
  const originalConsoleMethod = console[methodName]
  console[methodName] = function () {
    const message = arguments[0]
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
      arguments[0] = ''
    }
    originalConsoleMethod.apply(console, arguments)
  }
}

setInterval(async () => {
  if (global.stopped === 'close' || !global.conn || !global.conn.user) return
  await clearTmp()
  console.log(chalk.bold.cyanBright('\n╭» ❍ MULTIMEDIA ❍\n│→ ARCHIVOS DE LA CARPETA TMP ELIMINADOS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻'))
}, 1000 * 60 * 4) // 4 min

setInterval(async () => {
  if (global.stopped === 'close' || !global.conn || !global.conn.user) return
  await purgeEllenSession()
  console.log(chalk.bold.cyanBright(`\n╭» ❍ ${global.Ellensessions} ❍\n│→ SESIONES NO ESENCIALES ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
}, 1000 * 60 * 10) // 10 min

setInterval(async () => {
  if (global.stopped === 'close' || !global.conn || !global.conn.user) return
  console.log(await purgeOldFiles())
  console.log(chalk.bold.cyanBright('\n╭» ❍ ARCHIVOS ❍\n│→ ARCHIVOS RESIDUALES ELIMINADOS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻'))
}, 1000 * 60 * 10)

async function isValidPhoneNumber(number) {
  try {
    number = number.replace(/\s+/g, '')
    if (number.startsWith('+521')) number = number.replace('+521', '+52')
    else if (number.startsWith('+52') && number[4] === '1') number = number.replace('+52 1', '+52')
    const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
    return phoneUtil.isValidNumber(parsedNumber)
  } catch (error) {
    return false
  }
}
