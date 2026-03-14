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
global.prefix = new RegExp('^[#/!.]') 
global.timestamp = { start: new Date() }
const sessionFolder = global.ErisSessions || 'session'

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true))
};
const __dirname = global.__dirname(import.meta.url)

// --- PRESENTACIÓN INICIAL ---
console.log(chalk.bold.magenta('\n╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮'))
console.log(chalk.bold.white('  🚀 INICIALIZANDO NÚCLEO DE ERIS...  '))
console.log(chalk.bold.magenta('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n'))

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
console.log(chalk.green('✓ Base de datos cargada correctamente.\n'))

protoType()
serialize()

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
                console.error(chalk.bgRed.white(' ❌ ERROR PLUGIN ') + chalk.redBright(` Fallo al cargar: ${filename}\n`), e)
            }
        }
    }
}

// --- CONEXIÓN WHATSAPP ---
const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
const { version } = await fetchLatestBaileysVersion();

// 👇 LÓGICA DE CONEXIÓN SECUENCIAL 👇
let opcionConexion = '';
if (!state.creds.registered) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))
    
    console.log(chalk.bold.cyan('╭━ ⚙️  MÉTODO DE CONEXIÓN ━━━━━━━━━━━━━━━━━╮'))
    console.log(chalk.white('    1. Escanear Código QR                  '))
    console.log(chalk.white('    2. Código de 8 dígitos (Recomendado)   '))
    console.log(chalk.bold.cyan('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n'))
    
    opcionConexion = await question(chalk.yellowBright('➪ Escribe 1 o 2: '))
    rl.close()
}

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: opcionConexion === '1', 
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
    if (connection === 'open') {
        console.log(chalk.bold.green('\n╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮'))
        console.log(chalk.bold.white('  ❀ Eris-Bot Conectado Exitosamente ❀  '))
        console.log(chalk.bold.green('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n'))
    }
    if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
        if (reason !== DisconnectReason.loggedOut) {
            console.log(chalk.bgYellow.black.bold('\n ⚠️ ALERTA ') + chalk.yellowBright(' Conexión cerrada, intentando reconectar...'))
            await global.reloadHandler(true)
        } else {
            console.log(chalk.bgRed.white.bold('\n 🛑 DESCONECTADO ') + chalk.redBright(' Sesión cerrada. Por favor, borra la carpeta de sesión y vuelve a iniciar.'))
        }
    }
}

let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`)
        if (Object.keys(Handler || {}).length) handler = Handler
    } catch (e) { 
        console.error(chalk.redBright('Error al recargar handler:'), e) 
    }

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

// 👇 INICIO SECUENCIAL ORDENADO 👇
async function iniciarEris() {
    if (opcionConexion === '2') {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))
        
        console.log(chalk.bgCyan.black.bold('\n 📱 INGRESA TU NÚMERO '));
        console.log(chalk.cyanBright('(ej. 5215629885039)'));
        let numero = await question(chalk.yellowBright('➪ '));
        
        numero = numero.replace(/[^0-9]/g, '')
        rl.close()
        
        console.log(chalk.yellowBright('\n⏳ Generando código, por favor espera...'))

        // Cargamos los plugins aquí para que el texto salga exactamente donde quieres
        await filesInit()
        console.log(chalk.cyanBright(`✦ Plugins cargados en memoria: `) + chalk.bold.white(`${Object.keys(global.plugins).length}\n`))
        await global.reloadHandler()

        // Generamos el código
        setTimeout(async () => {
            try {
                let codigo = await global.conn.requestPairingCode(numero)
                codigo = codigo.match(/.{1,4}/g)?.join("-") || codigo
                
                // Diseño de caja centrado y pro
                console.log(chalk.bold.magenta('╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮'))
                console.log(chalk.bold.magenta('┃') + chalk.bold.white('     🔗 TU CÓDIGO DE WHATSAPP:     ') + chalk.bold.magenta('┃'))
                console.log(chalk.bold.magenta('┃') + chalk.bold.green(`             ${codigo}             `) + chalk.bold.magenta('┃'))
                console.log(chalk.bold.magenta('╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n'))
            } catch (error) {
                console.error(chalk.bgRed.white.bold('\n ❌ ERROR ') + chalk.redBright(' No se pudo solicitar el código. Asegúrate de escribir bien el número.\n'))
            }
        }, 3000)
    } else {
        // Si elige QR, carga normal
        await filesInit()
        console.log(chalk.cyanBright(`✦ Plugins cargados en memoria: `) + chalk.bold.white(`${Object.keys(global.plugins).length}\n`))
        await global.reloadHandler()
    }
}

iniciarEris().catch(console.error)

// Limpieza de TMP cada 5 minutos
setInterval(() => {
    const tmpDir = join(__dirname, 'tmp')
    if (existsSync(tmpDir)) {
        readdirSync(tmpDir).forEach(f => {
            try { unlinkSync(join(tmpDir, f)) } catch (e) {}
        })
    }
}, 1000 * 60 * 5)
