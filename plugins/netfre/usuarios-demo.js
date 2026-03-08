/*
import { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec)

let handler = async (m, { conn, command }) => {
  global.db.data.users[m.sender].comandos++

  const ownerNumber = global.owner[0][0].replace(/\D/g, '') + '@s.whatsapp.net'
  const isOwner = m.sender === ownerNumber

  // 🔒 Cooldown (3 días)
  const COOLDOWN = 259200000
  const last = global.db.data.users[m.sender].lastusuario || 0
  
  if (!isOwner && Date.now() - last < COOLDOWN) {
    const wait = msToTime(COOLDOWN - (Date.now() - last))
    throw `⏱️ ¡Espera ${wait} antes de crear otro usuario!`
  }
  
  global.db.data.users[m.sender].lastusuario = Date.now()

  const who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)

  await m.reply("💻 Creando usuario random, espera...")

  let stdout = ''
  try {
    const { stdout: out } = await exec('userbot')
    stdout = out
  } catch (e) {
    stdout = e.stdout || e.message
  }

  // 🟢 Mensaje al grupo (Solo texto)
  await conn.sendMessage(m.chat, { 
    text: `✅ *Cuenta generada*\n\nLos datos han sido enviados al privado.\n\n_Recuerda que puedes donar para mantener el servidor activo._` 
  }, { quoted: m })

  // 🟣 Mensaje privado (Solo texto con el resultado)
  const vpnData = m.quoted ? stdout + m.quoted.text : stdout
  await conn.sendMessage(who, {
    text: `❏ *DATOS DE CUENTA*\n\n${vpnData}\n\n*Nota:* Para Puertos Ssl WS Usar Payload.`
  })
}

handler.help = ['user']
handler.tags = ['netfree']
handler.command = /^(usuario|user)$/i
handler.group = true

export default handler

// 📌 Función para formatear el tiempo
function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

*/

import { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec)

let handler = async (m, { conn, command }) => {
  try {
    // Asegurarnos de que la base de datos esté cargada
    if (typeof global.loadDatabase === 'function' && (!global.db || !global.db.data)) {
      await global.loadDatabase()
    }

    // Inicializar estructura users si falta
    if (!global.db) throw new Error('Database no disponible')
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}

    // Asegurar que el registro del usuario exista
    if (!global.db.data.users[m.sender]) {
      global.db.data.users[m.sender] = { comandos: 0, lastusuario: 0 }
    }

    // Determinar si es owner (manejo robusto de global.owner)
    let ownerCandidate = ''
    if (Array.isArray(global.owner) && global.owner.length) {
      // puede ser ['1234567890'] o [['1234567890','name'], ...]
      ownerCandidate = Array.isArray(global.owner[0]) ? global.owner[0][0] : global.owner[0]
    } else if (typeof global.owner === 'string') {
      ownerCandidate = global.owner
    }
    ownerCandidate = String(ownerCandidate || '').replace(/\D/g, '')
    const ownerNumber = ownerCandidate ? ownerCandidate + '@s.whatsapp.net' : ''
    const isOwner = ownerNumber ? (m.sender === ownerNumber) : false

    // 🔒 Cooldown (3 días)
    const COOLDOWN = 3 * 24 * 60 * 60 * 1000 // 3 días en ms = 259200000
    const last = global.db.data.users[m.sender].lastusuario || 0

    if (!isOwner && Date.now() - last < COOLDOWN) {
      const wait = msToTime(COOLDOWN - (Date.now() - last))
      throw `⏱️ ¡Espera ${wait} antes de crear otro usuario!`
    }

    // Mensaje informando inicio del proceso
    await m.reply("💻 Creando usuario random, espera...")

    // Ejecutar comando externo (userbot)
    let stdout = ''
    try {
      const { stdout: out } = await exec('userbot')
      stdout = out || ''
    } catch (e) {
      // Si falla, capturamos salida de error si existe o el mensaje
      stdout = (e && (e.stdout || e.message)) ? (e.stdout || e.message) : String(e)
    }

    // Actualizar contador y último uso SOLO si el proceso fue realizado (evita consumir cooldown si falla críticamente)
    global.db.data.users[m.sender].comandos = (global.db.data.users[m.sender].comandos || 0) + 1
    global.db.data.users[m.sender].lastusuario = Date.now()
    // Intentar escribir la db inmediatamente (lowdb)
    try { await global.db.write() } catch (e) { console.error('Error escribiendo la DB:', e) }

    // 🟢 Mensaje al grupo (Solo texto)
    await conn.sendMessage(m.chat, {
      text: `✅ *Cuenta generada*\n\nLos datos han sido enviados al privado.\n\n_Recuerda que puedes donar para mantener el servidor activo._`
    }, { quoted: m })

    // 🟣 Mensaje privado (Solo texto con el resultado)
    const quotedText = (m.quoted && (m.quoted.text || m.quoted?.message?.conversation)) ? (m.quoted.text || m.quoted?.message?.conversation) : ''
    const vpnData = quotedText ? (stdout + '\n\n' + quotedText) : stdout
    const who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
    await conn.sendMessage(who, {
      text: `❏ *DATOS DE CUENTA*\n\n${vpnData}\n\n*Nota:* Para Puertos Ssl WS Usar Payload.`
    })
  } catch (err) {
    // Responder con el error al usuario (no romper el bot)
    const message = (err && err.message) ? err.message : String(err)
    console.error('Error en usuarios-demo:', err)
    // Intentar enviar la respuesta al chat original
    try { await m.reply(`❌ Error: ${message}`) } catch (e) { console.error('No se pudo enviar el mensaje de error:', e) }
  }
}

handler.help = ['user']
handler.tags = ['netfree']
handler.command = /^(usuario|user)$/i
handler.group = true

export default handler

// 📌 Función para formatear el tiempo
function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}
