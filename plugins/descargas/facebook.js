/* ERIS-MD FACEBOOK DOWNLOADER - VISUAL ERRORS */

import pkg from 'ruhend-scraper'
const { igdl } = pkg 
import fs from 'fs'
import path from 'path'

// --- DATOS OFICIALES DE ERIS ---
const newsletterJid = '120363407502496951@newsletter'
const newsletterName = 'Eris Service'
const redes = 'https://github.com/SINNOMBRE22/Eris-MD'

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  const url = args[0]
  
  // Cargamos la miniatura de Eris
  let thumb
  try {
    const imgPath = path.join(process.cwd(), 'src/imagenes/perfil2.jpeg')
    thumb = fs.readFileSync(imgPath)
  } catch {
    thumb = Buffer.alloc(0)
  }

  const name = m.pushName || (await conn.getName(m.sender)) || "Usuario"

  // --- RESPUESTA CON MINIATURA SI FALTA EL LINK ---
  if (!url) {
    const errorText = `🌸 *Enlace requerido, ${name}.*\n\nNecesito una URL de Facebook para descargar el video.\n> *Ejemplo:* ${usedPrefix + command} https://www.facebook.com/watch/?v=123`
    
    return conn.sendMessage(m.chat, {
      text: errorText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
        externalAdReply: {
          title: `🌸 ERIS SERVICE - HELP 🌸`,
          body: `Hola ${name}, te falta el enlace.`,
          thumbnail: thumb,
          mediaType: 1,
          renderLargerThumbnail: false,
          sourceUrl: redes
        }
      }
    }, { quoted: m })
  }

  // Validamos el formato del link
  if (!url.match(/facebook\.com|fb\.watch|fb\.com/g)) {
    return conn.reply(m.chat, `🌸 *Enlace inválido.* El link no parece ser de Facebook.`, m)
  }

  await m.react('🕓')

  try {
    const res = await igdl(url)
    const result = res.data

    if (!result || result.length === 0) throw new Error('No se encontraron medios.')

    const data = result.find(i => i.resolution === "720p (HD)") || 
                 result.find(i => i.resolution === "360p (SD)") || 
                 result.find(i => i.url && i.type === 'video') || 
                 result[0]

    if (!data || !data.url) throw new Error('URL de video no encontrada.')

    let caption = `╭─── [ 🎥 *FACEBOOK DOWNLOADER* ] ──···\n`
    caption += `│ 👤 *Usuario:* ${name}\n`
    caption += `│ ⚙️ *Calidad:* ${data.resolution || 'Óptima'}\n`
    caption += `╰─────────────────────────···\n\n`
    caption += `> 🌸 *Servidor de Medios - Eris Service*`

    await conn.sendMessage(m.chat, { 
      video: { url: data.url }, 
      caption: caption.trim(), 
      fileName: 'fb_eris.mp4', 
      mimetype: 'video/mp4',
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
        externalAdReply: {
          title: `🌸 ERIS SERVICE - FACEBOOK 🌸`,
          body: `Video listo para: ${name}`,
          thumbnail: thumb,
          mediaType: 1,
          renderLargerThumbnail: false,
          sourceUrl: redes
        }
      }
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error("Error Facebook DL:", e)
    await m.react('❌')
    conn.reply(m.chat, `🌸 *Error de descarga:* No pude procesar el video. Intenta con otro enlace.`, m)
  }
}

handler.help = ['facebook <url>', 'fb <url>']
handler.tags = ['descargas']
handler.command = ['facebook', 'fb']
handler.register = false

export default handler
