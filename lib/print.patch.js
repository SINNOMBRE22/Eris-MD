import { extractSenderJid } from '../lib/extractSender.js' // ajustar ruta si hace falta

// dentro de la función principal:
let rawSenderJid = extractSenderJid(m, conn)
let _name = await conn.getName?.(rawSenderJid) || ''
let senderNumber = '??'
try {
  const numeric = rawSenderJid.replace('@s.whatsapp.net', '').replace(/\D/g, '')
  if (numeric) senderNumber = PhoneNumber('+' + numeric).getNumber('international')
} catch (e) { senderNumber = rawSenderJid || '??' }
let sender = senderNumber + (_name ? ' ~' + _name : '')
