process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './settings.js'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, watch } from 'fs'
import yargs from 'yargs';
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { format } from 'util'
import pino from 'pino'
import path, { join } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import store from './lib/store.js'
const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import('@whiskeysockets/baileys')
import readline from 'readline'
import NodeCache from 'node-cache'

const { chain } = lodash

// --- CONFIGURACIÓN DE OPCIONES ---
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#/!.]') // ⬅️ ESTO ERA LO QUE FALTABA PARA QUE RESPONDA
global.timestamp = { start: new Date() }
const sessionFolder = global.Ellensessions || 'session'

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; 
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true))
}; 
const __dirname = global.__dirname(import.meta.url)

console.log(chalk.cyanBright('\n🚀 Inicializando núcleo de Eris...'))

// --- BASE DE DATOS ---
global.db = new Low(new JSONFile('./src/database/database.json'))
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return
    global.db.READ = true
    await global.db.read().catch(console.error)
    global.db.READ = null
    global.db.data = { users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, ...(global.db.data || {}), }
    global.db.chain = chain(global.db.data)
}
await loadDatabase()

protoType()
serialize()

// --- CONEXIÓN WHATSAPP ---
const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
const { version } = await fetchLatestBaileysVersion();

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !fs.existsSync(`./${sessionFolder}/creds.json`),
    browser: ['Ubuntu', 'Edge', '110.0.1587.56'],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
    },
    version,
    getMessage: async (clave) => {
        let jid = jidNormalizedUser(clave.remoteJid)
        let msg = await store.loadMessage(jid, clave.id)
        return msg?.message || ""
    }
}

global.conn = makeWASocket(connectionOptions);

// --- MANEJADORES ---
async function connectionUpdate(update) {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') console.log(chalk.bold.green('\n❀ Eris-Bot Conectado Exitosamente ❀'))
    if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
        if (reason !== DisconnectReason.loggedOut) {
            console.log(chalk.bold.yellow('\n⚠️ Conexión cerrada, reconectando...'))
            await global.reloadHandler(true)
        }
    }
}

let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`)
        if (Object.keys(Handler || {}).length) handler = Handler
    } catch (e) { console.error(e) }

    if (restatConn) {
        try { global.conn.ws.close() } catch { }
        conn.ev.removeAllListeners()
        global.conn = makeWASocket(connectionOptions)
    }

    global.conn.handler = handler.handler.bind(global.conn)
    global.conn.connectionUpdate = connectionUpdate.bind(global.conn)
    global.conn.credsUpdate = saveCreds.bind(global.conn, true)

    global.conn.ev.on('messages.upsert', global.conn.handler)
    global.conn.ev.on('connection.update', global.conn.connectionUpdate)
    global.conn.ev.on('creds.update', global.conn.credsUpdate)
}

// --- CARGA RECURSIVA PARA HANDLER ---
const pluginFolder = path.join(__dirname, './plugins')
global.plugins = {}

async function filesInit(folder = pluginFolder) {
    if (!existsSync(folder)) mkdirSync(folder, { recursive: true })
    
    for (const filename of readdirSync(folder)) {
        const filePath = join(folder, filename)
        if (statSync(filePath).isDirectory()) {
            await filesInit(filePath)
        } else if (filename.endsWith('.js')) {
            try {
                const fileURL = pathToFileURL(filePath).href
                const module = await import(`${fileURL}?update=${Date.now()}`)
                const name = path.relative(pluginFolder, filePath).replace(/\\/g, '/')
                global.plugins[name] = module.default || module
            } catch (e) {
                console.error(`❌ Error al cargar plugin: ${filename}\n`, e)
            }
        }
    }
}

// --- INICIO ---
filesInit().then(() => {
    console.log(chalk.cyan(`✦ Plugins cargados: ${Object.keys(global.plugins).length}`))
    return global.reloadHandler()
}).catch(console.error)

// Limpieza de TMP cada 5 minutos
setInterval(() => {
    const tmpDir = join(__dirname, 'tmp')
    if (existsSync(tmpDir)) {
        readdirSync(tmpDir).forEach(f => {
            try { unlinkSync(join(tmpDir, f)) } catch (e) {}
        })
    }
}, 1000 * 60 * 5)
