import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts?.['img'] ? require('terminal-image') : null
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function (m, conn = { user: {} }) {
  let _name = await conn.getName?.(m.sender) || ''
  let sender = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') + (_name ? ' ~' + _name : '')
  let chat = await conn.getName?.(m.chat) || ''
  let img = null
  try {
    if (global.opts?.['img'] && /sticker|image/gi.test(m.mtype)) {
      img = await terminalImage.buffer(await m.download())
    }
  } catch (e) {
    console.error(e)
  }

  let filesize = (
    m.msg
      ? m.msg.vcard ? m.msg.vcard.length
        : m.msg.fileLength ? (m.msg.fileLength.low || m.msg.fileLength)
        : m.msg.axolotlSenderKeyDistributionMessage ? m.msg.axolotlSenderKeyDistributionMessage.length
        : m.text ? m.text.length : 0
      : m.text ? m.text.length : 0
  ) || 0

  // Info del bot receptor
  let botNumber = conn.user?.jid ? PhoneNumber('+' + conn.user.jid.replace('@s.whatsapp.net', '')).getNumber('international') : '??'
  let botName = conn.user?.name || 'Eris'

  // Hora local (RD) formato AM/PM
  let oraRD = new Date().toLocaleString('en-US', {
    timeZone: 'America/Santo_Domingo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  let chatName = chat ? (m.isGroup ? 'Grupo: ' + chat : 'Privado: ' + chat) : 'Eris'

  function humanSize(bytes) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  console.log([
    `╭─── [ 🦈 ${chalk.black.bgCyan(' ERIS HOUSEKEEPING ')} ] ──···`,
    `│ 🤖 ${chalk.cyan('BOT RECEPTOR:')} ${chalk.white(botNumber)} ${chalk.gray('(' + botName + ')')}`,
    `│ 🕒 ${chalk.cyan('HORA:')} ${chalk.white(oraRD)}`,
    `│ 📂 ${chalk.cyan('TIPO:')} ${chalk.white(m.messageStubType ? m.messageStubType : 'MENSAJE')}`,
    `│ ⌨ ${chalk.cyan('PESO:')} ${chalk.white(filesize + ' — ' + humanSize(filesize))}`,
    `│ ✦ ${chalk.cyan('DE:')} ${chalk.white(sender)}`,
    `│ ❑ ${chalk.cyan('UBICACIÓN:')} ${chalk.white(chatName)}`,
    `│ 🍭 ${chalk.cyan('PROTOCOLO:')} ${chalk.white(m.mtype ? m.mtype.replace(/message$/i, '').replace('audio', m.msg?.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : 'Unknown')}`,
    `╰─────────────────────────────────────────────────···`
  ].join('\n'))

  if (img) console.log(img.trimEnd())

  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')
    let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g
    let mdFormat = (depth = 4) => (_, type, text, monospace) => {
      let types = { _: 'italic', '*': 'bold', '~': 'strikethrough' }
      text = text || monospace
      return !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)))
    }

    log = log.replace(urlRegex, (url) => chalk.redBright.underline(url))
    log = log.replace(mdRegex, mdFormat(4))

    if (m.mentionedJid) {
      for (let userJid of m.mentionedJid) {
        try {
          log = log.replace('@' + userJid.split`@`[0], chalk.redBright('@' + await conn.getName(userJid)))
        } catch {}
      }
    }

    console.log(m.error != null ? chalk.red.bold('✖ ' + log) : m.isCommand ? chalk.greenBright('⚡ ' + log) : '💬 ' + log)
  }

  if (m.messageStubParameters && m.messageStubParameters.length > 0) {
    try {
      console.log(chalk.gray('  └─ ') + (await Promise.all(m.messageStubParameters.map(async jid => {
        jid = conn.decodeJid(jid)
        let name = await conn.getName(jid)
        const phoneNumber = PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
        return name ? chalk.redBright(`${phoneNumber} (${name})`) : ''
      }))).filter(Boolean).join(', '))
    } catch (e) {
      console.error(e)
    }
  }

  if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds || 0
    console.log(`${m.msg.ptt ? '🎤' : '🎵'} ${chalk.cyan('AUDIO REPRODUCIDO')} [${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}]`)
  }
  console.log()
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.redBright("🦈 Eris: 'lib/print.js' actualizado"))
})
