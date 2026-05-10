/* ERIS-MD ANIME DOWNLOADER - v1
   Busca el video en Facebook/YouTube via yt-dlp
   Lo envía como DOCUMENTO .mp4 (sin límite de 64 MB de WA)
   Uso: .animedl konosuba capitulo 1 completo español                    */

import fs        from 'fs'
import path      from 'path'
import https     from 'https'
import http      from 'http'
import { spawn } from 'child_process'
import os        from 'os'

const newsletterJid  = '120363407502496951@newsletter'
const newsletterName = 'Eris Service'
const redes          = 'https://github.com/SINNOMBRE22/Eris-MD'

// ── HTTP fetch → Buffer ──────────────────────────────────────────────
function fetchBuffer(url, opts = {}, redir = 8) {
  return new Promise((resolve, reject) => {
    if (!redir) return reject(new Error('Demasiados redirects'))
    try {
      const parsed  = new URL(url)
      const mod     = parsed.protocol === 'https:' ? https : http
      const options = {
        hostname: parsed.hostname,
        port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path:     parsed.pathname + parsed.search,
        method:   opts.method || 'GET',
        headers: {
          'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept':          'text/html,application/xhtml+xml,application/json,*/*;q=0.9',
          'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
          'Accept-Encoding': 'identity',
          ...opts.headers
        },
        timeout: 180000   // 3 min — videos largos necesitan más tiempo
      }
      const req = mod.request(options, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : `${parsed.protocol}//${parsed.host}${res.headers.location}`
          return fetchBuffer(next, opts, redir - 1).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} → ${url}`))
        const chunks = []
        res.on('data',  c => chunks.push(c))
        res.on('end',   () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      })
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout — el video tardó demasiado en descargarse')) })
      req.on('error', reject)
      if (opts.body) req.write(opts.body)
      req.end()
    } catch (e) { reject(e) }
  })
}

// ── Verificar que yt-dlp está instalado ─────────────────────────────
function ytdlpExists() {
  return new Promise((resolve) => {
    const proc = spawn('yt-dlp', ['--version'])
    proc.on('error', () => resolve(false))
    proc.on('close', (code) => resolve(code === 0))
  })
}

// ── Buscar en YouTube el primer resultado y descargar ────────────────
// query: texto libre, ej. "konosuba capitulo 1 completo español"
function ytdlpSearchAndDownload(query) {
  return new Promise((resolve, reject) => {
    // Primero obtenemos la URL del primer resultado de YouTube
    const searchProc = spawn('yt-dlp', [
      '--no-playlist',
      '--format', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[ext=mp4]/best',
      '--get-url',
      '--no-warnings',
      `ytsearch1:${query}`   // busca en YouTube y toma el primer resultado
    ])

    let stdout = ''
    let stderr = ''
    searchProc.stdout.on('data', d => { stdout += d.toString() })
    searchProc.stderr.on('data', d => { stderr += d.toString() })

    searchProc.on('close', async (code) => {
      if (code !== 0 || !stdout.trim()) {
        return reject(new Error(`yt-dlp búsqueda falló (code ${code}): ${stderr.trim().split('\n').pop() || 'sin resultado'}`) )
      }

      const urls = stdout.trim().split('\n').filter(Boolean)

      if (urls.length === 1) {
        // Un solo stream → descarga directa
        try {
          const buf = await fetchBuffer(urls[0], { headers: { 'Referer': 'https://www.youtube.com/' } })
          return resolve({ buffer: buf, calidad: 'HD', fuente: 'YouTube' })
        } catch (e) {
          return reject(new Error(`Descarga directa falló: ${e.message}`))
        }
      }

      // Video + audio separados → merge con ffmpeg a archivo temporal
      const tmpFile = path.join(os.tmpdir(), `anime_eris_${Date.now()}.mp4`)
      const dlProc  = spawn('yt-dlp', [
        '--no-playlist',
        '--format', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '--no-warnings',
        '-o', tmpFile,
        `ytsearch1:${query}`
      ])

      let dlErr = ''
      dlProc.stderr.on('data', d => { dlErr += d.toString() })
      dlProc.on('close', (dlCode) => {
        if (dlCode !== 0) {
          try { fs.unlinkSync(tmpFile) } catch {}
          return reject(new Error(`yt-dlp merge falló (code ${dlCode}): ${dlErr.trim().split('\n').pop() || 'sin detalle'}`))
        }
        try {
          const buf = fs.readFileSync(tmpFile)
          fs.unlinkSync(tmpFile)
          return resolve({ buffer: buf, calidad: 'HD', fuente: 'YouTube' })
        } catch (e) {
          return reject(new Error(`Lectura archivo temporal falló: ${e.message}`))
        }
      })
      dlProc.on('error', (e) => reject(new Error(`yt-dlp spawn error: ${e.message}`)))
    })
    searchProc.on('error', (e) => reject(new Error(`yt-dlp spawn error: ${e.message}`)))
  })
}

// ── Obtener título real del video antes de descargar ─────────────────
function getVideoTitle(query) {
  return new Promise((resolve) => {
    const proc = spawn('yt-dlp', [
      '--no-playlist',
      '--get-title',
      '--no-warnings',
      `ytsearch1:${query}`
    ])
    let out = ''
    proc.stdout.on('data', d => { out += d.toString() })
    proc.on('close', () => resolve(out.trim().split('\n')[0] || query))
    proc.on('error', () => resolve(query))
  })
}

// ── Handler ──────────────────────────────────────────────────────────
const handler = async (m, { conn, args, usedPrefix, command }) => {
  const query = args.join(' ').trim()

  let thumb = Buffer.alloc(0)
  try { thumb = fs.readFileSync(path.join(process.cwd(), 'src/imagenes/perfil2.jpeg')) } catch {}

  const name = m.pushName || (await conn.getName(m.sender)) || 'Usuario'

  // ── Sin argumentos: mostrar ayuda con ejemplos ───────────────────
  if (!query) {
    return conn.sendMessage(m.chat, {
      text: [
        `╭─── [ 🎌 *ANIME DOWNLOADER* ] ──···`,
        `│`,
        `│ ⚠️ *Debes indicar qué anime buscar.*`,
        `│`,
        `│ 📌 *Uso:*`,
        `│ ${usedPrefix + command} <nombre del anime>`,
        `│`,
        `│ 📖 *Ejemplos:*`,
        `│ • ${usedPrefix + command} konosuba capitulo 1 completo español`,
        `│ • ${usedPrefix + command} dragon ball z capitulo 5 latino`,
        `│ • ${usedPrefix + command} naruto shippuden episodio 1 sub español`,
        `│ • ${usedPrefix + command} one piece episodio 1000 completo`,
        `│`,
        `│ 💡 *Tip:* Mientras más específico seas`,
        `│    mejor será el resultado encontrado.`,
        `│`,
        `│ 📁 El video se envía como *archivo .mp4*`,
        `│    para evitar el límite de tamaño de WA.`,
        `╰─────────────────────────────────···`,
        ``,
        `> 🌸 *Servidor de Medios - Eris Service*`
      ].join('\n'),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999, isForwarded: true,
        forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
        externalAdReply: {
          title: `🌸 ERIS SERVICE - ANIME DL 🌸`,
          body: `Hola ${name}, indica el anime que quieres.`,
          thumbnail: thumb, mediaType: 1, renderLargerThumbnail: false, sourceUrl: redes
        }
      }
    }, { quoted: m })
  }

  // ── Verificar yt-dlp ─────────────────────────────────────────────
  const hasYtdlp = await ytdlpExists()
  if (!hasYtdlp) {
    return conn.reply(
      m.chat,
      `❌ *yt-dlp no está instalado en el servidor.*\n\nEjecuta en tu VPS:\n\`\`\`pip install yt-dlp\`\`\``,
      m
    )
  }

  await m.react('🔍')

  // Obtener título primero para mostrarlo al usuario
  const videoTitle = await getVideoTitle(query)

  await conn.sendMessage(m.chat, {
    text: [
      `╭─── [ 🎌 *ANIME DOWNLOADER* ] ──···`,
      `│ 🔍 *Buscando:* ${query}`,
      `│ 🎬 *Encontrado:* ${videoTitle}`,
      `│ ⏳ *Descargando... esto puede tardar*`,
      `│    *unos minutos para videos largos.*`,
      `╰─────────────────────────────────···`
    ].join('\n')
  }, { quoted: m })

  await m.react('⏳')

  try {
    const videoData = await ytdlpSearchAndDownload(query)

    if (!videoData.buffer || videoData.buffer.length < 5000)
      throw new Error('El video descargado está vacío o es inválido.')

    const sizeMB = (videoData.buffer.length / 1024 / 1024).toFixed(1)

    const caption = [
      `╭─── [ 🎌 *ANIME DOWNLOADER* ] ──···`,
      `│ 👤 *Usuario:* ${name}`,
      `│ 🔍 *Búsqueda:* ${query}`,
      `│ 🎬 *Título:* ${videoTitle}`,
      `│ ⚙️ *Calidad:* ${videoData.calidad}`,
      `│ 📦 *Tamaño:* ${sizeMB} MB`,
      `│ 🌐 *Fuente:* ${videoData.fuente}`,
      `╰─────────────────────────────────···`,
      ``,
      `> 🌸 *Servidor de Medios - Eris Service*`
    ].join('\n')

    // ── Envío como DOCUMENTO (sin límite de 64 MB de WA) ────────────
    await conn.sendMessage(m.chat, {
      document: videoData.buffer,
      caption,
      fileName: `${videoTitle.slice(0, 60).replace(/[^\w\s\-]/g, '')}.mp4`,
      mimetype: 'video/mp4',
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999, isForwarded: true,
        forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
        externalAdReply: {
          title: `🌸 ERIS SERVICE - ANIME DL 🌸`,
          body: `Archivo listo para: ${name}`,
          thumbnail: thumb, mediaType: 1, renderLargerThumbnail: false, sourceUrl: redes
        }
      }
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('[ANIMEDL] Error:', e.message)
    await m.react('❌')
    conn.reply(
      m.chat,
      [
        `🌸 *Error al descargar el video.*`,
        ``,
        `📋 *Detalle:* ${e.message}`,
        ``,
        `💡 *Sugerencias:*`,
        `• Sé más específico en la búsqueda`,
        `• Agrega "completo" o "sub español" al final`,
        `• Verifica que yt-dlp esté actualizado`
      ].join('\n'),
      m
    )
  }
}

handler.help     = ['animedl <nombre anime capitulo>']
handler.tags     = ['descargas']
handler.command  = ['animedl', 'anime']
handler.register = false

export default handler
