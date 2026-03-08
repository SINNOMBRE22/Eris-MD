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

