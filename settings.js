import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

// --- Números y permisos (editar solo los valores) ---
/*
// --- Números y permisos (editar solo los valores) ---
global.owner = [
  ['525629885039', 'SinNombre', true], // Tu número real
]
global.rowner = [
  ['525629885039', 'SinNombre', true], // Tu número real
]

global.mods = []
global.prems = []
global.suittag = []
*/

//BETA: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
global.botNumber = '' //Ejemplo: 573218138672

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
// <-- Número @s.whatsapp.net -->
  ['5215629885039', 'SinNombre', true],
  ['525629885039', 'SinNombre', true],
];

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.mods = []
global.suittag = ['18096758983']
global.prems = []

// --- Info visible del bot ---
global.libreria = 'Baileys'
global.baileys = 'V 6.7.16'
global.languaje = 'Español'
global.vs = '2.2.0'
global.nameqr = 'eris-md'
global.namebot = 'Eris Bot'
global.ErisSessions = 'ErisSessions'    // nueva carpeta de sesiones
global.Ellensessions = global.ErisSessions // alias por compatibilidad
global.jadi = 'ErisJadiBots'
global.EllenJadibts = false

// --- Contact card ---
global.fkontak = {
  key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
  message: {
    contactMessage: {
      displayName: `Eris Bot`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Eris Bot;;;\nFN:Eris Bot\nitem1.TEL;waid=${global.botNumber}:${global.botNumber}\nitem1.X-ABLabel:Bot\nEND:VCARD`
    }
  }
};

global.APIKeys = {}

// --- Branding y textos ---
global.packname = 'Eris'
global.botname = 'Eris Bot MD'
global.wm = 'Eris Bot MD'
global.author = 'SinNombre'
global.dev = 'Custom Mods'
global.textbot = 'Eris Bot • Powered by SinNombre'
global.etiqueta = 'Eris'

// --- Mensajes / assets ---
global.moneda = 'Denique'
global.welcom1 = '❍ Edita Con El Comando setwelcome'
global.welcom2 = '❍ Edita Con El Comando setbye'
global.banner = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1747289219876.jpeg'
global.avatar = 'https://qu.ax/RYjEw.jpeg'

// --- Enlaces (rellenar si procede) ---
global.gp1 = ''
global.comunidad1 = ''
global.channel = ''
global.channel2 = ''
global.md = ''
global.correo = ''
global.cn = ''

// --- Assets locales ---
try { global.catalogo = fs.readFileSync('./src/catalogo.jpg') } catch { global.catalogo = null }
global.estilo = { key: { fromMe: false, participant: `0@s.whatsapp.net` }, message: { orderMessage: { itemCount : -999999, status: 1, itemId: 'I-GR', title: 'Eris', thumbnail: global.catalogo || Buffer.alloc(0), fileLength: 9999999, mediaType: 1, mediaUrl: '', jpegThumbnail: global.catalogo || Buffer.alloc(0) } } };

global.ch = { ch1: '120363335626706839@newsletter' }

// --- Utilidades globales ---
global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

// --- rpg / rpgg (sin level/coin/exp visibles) ---
global.rpg = {
  emoticon(string) {
    string = string.toLowerCase();
    const emot = {
      bank: '🏦 Banco',
      diamond: '💎 Diamante',
      health: '❤️ Salud',
      kyubi: '🌀 Magia',
      joincount: '💰 Token',
      emerald: '♦️ Esmeralda',
      stamina: '⚡ Energía',
      role: '⚜️ Rango',
      premium: '🎟️ Premium',
      gold: '👑 Oro',
      iron: '⛓️ Hierro',
      coal: '🌑 Carbón',
      stone: '🪨 Piedra',
      potion: '🥤 Poción',
    };
    const results = Object.keys(emot).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(string));
    if (!results.length) return '';
    return emot[results[0][0]];
  }
};
global.rpgg = { emoticon: (s) => { s = s.toLowerCase(); const m = { bank:'🏦', diamond:'💎', health:'❤️', kyubi:'🌀', joincount:'💰', emerald:'♦️', stamina:'⚡', role:'⚜️', premium:'🎟️', gold:'👑', iron:'⛓️', coal:'🌑', stone:'🪨', potion:'🥤' }; const r = Object.keys(m).map(v=>[v,new RegExp(v,'gi')]).filter(v=>v[1].test(s)); return r.length?m[r[0][0]]:'' } };

// --- Recarga automática ---
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js' (Eris)"))
  import(`${file}?update=${Date.now()}`)
})
