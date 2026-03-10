import fetch from 'node-fetch'
import cheerio from 'cheerio'

/**
 * Utilidades para YouTube scraping ligero (metadatos, búsqueda básica y generación de enlaces de descarga
 * mediante módulos auxiliares preexistentes en el repo: youtubedl.js / y2mate.js / ytmirror).
 *
 * Diseño:
 * - Intentamos reutilizar módulos locales (youtubedl.js / y2mate.js) si existen.
 * - Si no, devolvemos errores descriptivos para que el invocador pueda optar por otro método.
 *
 * Notas:
 * - Este archivo evita dependencias pesadas y usa scraping HTTP + parseo JSON embebido en las páginas de YouTube.
 * - YouTube cambia su HTML/JS con frecuencia; las funciones incluyen validaciones para no lanzar excepciones crípticas.
 */

/* ---------------------------
   Helpers básicos
   --------------------------- */
export function is_link(input) {
  // Valida enlaces HTTP/HTTPS simples
  const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i
  return regex.test(input)
}

export function get_id(url) {
  if (!url || typeof url !== 'string') return null
  // Extraer ID de YouTube soportando múltiples formatos
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*?&v=)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m && m[1]) return m[1]
  }
  // fallback: si el argumento ya parece ser un id
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url
  return null
}

export function make_id(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length))
  return out
}

export function format_date(input) {
  // Si input es segundos (número) -> HH:MM:SS
  if (typeof input === 'number' || /^\d+$/.test(String(input))) {
    const sec = Number(input)
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return (h > 0 ? `${h}:` : '') + `${String(m).padStart(h > 0 ? 2 : 1, '0')}:${String(s).padStart(2, '0')}`
  }
  // Si es ISO date string
  try {
    const d = new Date(input)
    if (!isNaN(d)) return d.toISOString()
  } catch {}
  return String(input)
}

export function decode(enc) {
  // Intento decodificar base64 con tolerancia
  try {
    if (typeof enc !== 'string') return enc
    // Eliminar caracteres inválidos y completar padding
    let s = enc.replace(/[^A-Za-z0-9+/=]/g, '')
    while (s.length % 4 !== 0) s += '='
    return Buffer.from(s, 'base64').toString('utf8')
  } catch {
    return enc
  }
}

/* ---------------------------
   Scrape metadata from watch page
   --------------------------- */
async function extractInitialPlayerResponse(html) {
  // Busca el objeto ytInitialPlayerResponse en la página
  const patterns = [
    /ytInitialPlayerResponse\s*=\s*(\{.+?\});/s,
    /window\["ytInitialPlayerResponse"\]\s*=\s*(\{.+?\});/s
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m && m[1]) {
      try {
        return JSON.parse(m[1])
      } catch (e) {
        // intentar extracción más permissiva:
        try {
          const jsonText = m[1].replace(/\n/g, ' ')
          return JSON.parse(jsonText)
        } catch {}
      }
    }
  }
  return null
}

/**
 * metadata(linkOrId)
 * - linkOrId: URL de YouTube o el id de 11 caracteres
 * Retorna: { id, title, description, author, lengthSeconds, viewCount, thumbnails: [], formats: [...] }
 */
export async function metadata(linkOrId) {
  const id = get_id(linkOrId) || (typeof linkOrId === 'string' && linkOrId.length === 11 ? linkOrId : null)
  if (!id) throw new Error('Invalid YouTube link or id')

  const url = `https://www.youtube.com/watch?v=${id}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`Failed to fetch video page: ${res.status}`)
  const html = await res.text()

  // Extraer player response
  const player = await extractInitialPlayerResponse(html)
  if (!player) {
    // fallback: intentar extraer título con cheerio (muy básico)
    const $ = cheerio.load(html)
    const title = $('meta[name="title"]').attr('content') || $('title').text() || ''
    const author = $('link[itemprop="name"]').attr('content') || $('meta[itemprop="author"]').attr('content') || ''
    const thumbnails = []
    const thumb = $('link[itemprop="thumbnailUrl"]').attr('href') || $('meta[property="og:image"]').attr('content')
    if (thumb) thumbnails.push({ url: thumb })
    return {
      id,
      title: title.trim(),
      description: $('meta[name="description"]').attr('content') || '',
      author: author.trim(),
      lengthSeconds: null,
      viewCount: null,
      thumbnails
    }
  }

  const videoDetails = player.videoDetails || {}
  const microformat = player.microformat?.playerMicroformatRenderer || {}

  return {
    id: videoDetails.videoId || id,
    title: videoDetails.title || '',
    description: videoDetails.shortDescription || '',
    author: videoDetails.author || microformat.ownerProfileUrl || '',
    lengthSeconds: Number(videoDetails.lengthSeconds || microformat.lengthSeconds || 0),
    viewCount: Number(videoDetails.viewCount || 0),
    thumbnails: (videoDetails.thumbnail?.thumbnails || []).map(t => ({ url: t.url, width: t.width, height: t.height })),
    // formats: podemos devolver la lista de streamingFormats si existiera (no limpia aquí)
    formats: player.streamingData ? (player.streamingData.formats || []).concat(player.streamingData.adaptiveFormats || []) : []
  }
}

/* ---------------------------
   Search
   --------------------------- */
function parseInitialData(html) {
  const patterns = [
    /ytInitialData\s*=\s*(\{.+?\});/s,
    /window\["ytInitialData"\]\s*=\s*(\{.+?\});/s
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m && m[1]) {
      try {
        return JSON.parse(m[1])
      } catch {
        try {
          return JSON.parse(m[1].replace(/\n/g, ' '))
        } catch {}
      }
    }
  }
  return null
}

/**
 * search(query)
 * - Realiza una búsqueda básica en YouTube y extrae resultados de video.
 * - Retorna array de items: { id, title, duration, thumbnail, channel, views }
 */
export async function search(query) {
  if (!query) return []
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error('Failed to search YouTube')
  const html = await res.text()

  const initialData = parseInitialData(html)
  if (!initialData) {
    // fallback simple: parse links in HTML
    const $ = cheerio.load(html)
    const results = []
    $('a').each((i, el) => {
      const href = $(el).attr('href')
      if (href && /\/watch\?v=/.test(href)) {
        const id = get_id(href)
        const title = $(el).attr('title') || $(el).text() || ''
        if (id) results.push({ id, title })
      }
    })
    // unique by id
    const seen = new Set()
    return results.filter(r => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    }).slice(0, 20)
  }

  // Navegar por initialData para encontrar videoRenderer nodes
  const contents = initialData.contents || initialData
  // Búsqueda recursiva para videoRenderer
  const videoRenderers = []
  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return
    if (obj.videoRenderer) videoRenderers.push(obj.videoRenderer)
    for (const key of Object.keys(obj)) {
      walk(obj[key])
    }
  }
  walk(contents)

  const results = videoRenderers.map(v => {
    const id = v.videoId || (v.navigationEndpoint && v.navigationEndpoint.commandMetadata && v.navigationEndpoint.commandMetadata.webCommandMetadata && v.navigationEndpoint.commandMetadata.webCommandMetadata.url && get_id(v.navigationEndpoint.commandMetadata.webCommandMetadata.url))
    const title = v.title && (v.title.runs ? v.title.runs.map(r => r.text).join('') : v.title.simpleText) || ''
    const thumbnail = v.thumbnail && v.thumbnail.thumbnails && v.thumbnail.thumbnails.slice(-1)[0]?.url
    const duration = v.lengthText ? (v.lengthText.simpleText || (v.lengthText.runs && v.lengthText.runs.map(r => r.text).join(''))) : null
    const channel = v.ownerText && v.ownerText.runs && v.ownerText.runs[0] && v.ownerText.runs[0].text
    const views = v.viewCountText ? (v.viewCountText.simpleText || '') : ''
    return { id, title, thumbnail, duration, channel, views }
  }).filter(r => r.id).slice(0, 25)

  return results
}

/* ---------------------------
   Download wrappers (usa youtubedl.js / y2mate.js si están presentes)
   --------------------------- */

/**
 * Internal helper: intenta usar módulos locales disponibles para obtener enlaces de descarga.
 * Retorna objeto uniforme: { status: true/false, service: 'ogmp3'|'y2mate'|'native', result: {...}, error }
 */
async function attemptExternalDownload(link, format = 'audio', quality = null) {
  // Intento 1: usar ./youtubedl.js (exporta ogmp3)
  try {
    const ytd = await import('./youtubedl.js')
    if (ytd && ytd.ogmp3 && typeof ytd.ogmp3.download === 'function') {
      const type = format === 'audio' ? 'audio' : 'video'
      const fmt = quality || (type === 'audio' ? ytd.ogmp3.default_fmt.audio : ytd.ogmp3.default_fmt.video)
      const r = await ytd.ogmp3.download(link, fmt, type)
      return { status: true, service: 'ogmp3', result: r }
    }
  } catch (e) {
    // continue to next option
  }

  // Intento 2: usar ./y2mate.js (exporta yta/ytv)
  try {
    const y2 = await import('./y2mate.js')
    if (y2) {
      if (format === 'audio' && typeof y2.yta === 'function') {
        const r = await y2.yta(link)
        return { status: true, service: 'y2mate', result: r }
      }
      if (format === 'video' && typeof y2.ytv === 'function') {
        const r = await y2.ytv(link)
        return { status: true, service: 'y2mate', result: r }
      }
    }
  } catch (e) {
    // continue
  }

  // Intento 3: fallback - indicar que no hay proveedor disponible
  return { status: false, error: 'No external downloader available (install/enable youtubedl.js or y2mate.js)' }
}

/**
 * savetube(link, quality, value)
 * - link: url o id
 * - quality: formato deseado (ej. 128 para mp3 o 360/720 para video)
 * - value: 'audio' | 'video'
 *
 * Retorna la respuesta del servicio externo o lanza error.
 */
export async function savetube(link, quality = null, value = 'audio') {
  const id = get_id(link) || link
  if (!id) throw new Error('Invalid YouTube link or id')
  const attempt = await attemptExternalDownload(link, value === 'audio' ? 'audio' : 'video', quality)
  if (!attempt.status) throw new Error(attempt.error || 'No downloader available')
  return attempt.result
}

/**
 * ytmp3(link, formats = 128)
 * - wrapper para descargar audio (mp3) usando proveedores disponibles
 */
export async function ytmp3(link, formats = 128) {
  return await savetube(link, formats, 'audio')
}

/**
 * ytmp4(link, formats = 360)
 * - wrapper para descargar video (mp4) usando proveedores disponibles
 */
export async function ytmp4(link, formats = 360) {
  return await savetube(link, formats, 'video')
}

/**
 * apimp3 / apimp4
 * - alias a ytmp3 / ytmp4 para compatibilidad
 */
export async function apimp3(link, formats = 128) {
  return await ytmp3(link, formats)
}
export async function apimp4(link, formats = 360) {
  return await ytmp4(link, formats)
}

/* ---------------------------
   Channel metadata
   --------------------------- */
export async function channel(input) {
  // acepta URL de canal, nombre de usuario o id
  if (!input) throw new Error('No channel input')
  const url = is_link(input) ? input : `https://www.youtube.com/${input}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error('Failed to fetch channel page')
  const html = await res.text()
  const data = parseInitialData(html) || {}
  // intento de parse minimal
  const channelInfo = {}
  try {
    // buscar channelRenderer en initialData
    const findChannel = (obj) => {
      if (!obj || typeof obj !== 'object') return null
      if (obj.channelRenderer) return obj.channelRenderer
      for (const k of Object.keys(obj)) {
        const r = findChannel(obj[k])
        if (r) return r
      }
      return null
    }
    const ch = findChannel(data)
    if (ch) {
      channelInfo.id = ch.channelId
      channelInfo.title = ch.title && (ch.title.runs ? ch.title.runs.map(r => r.text).join('') : ch.title.simpleText)
      channelInfo.subscribers = ch.subscriberCountText?.simpleText || ''
      channelInfo.thumbnails = ch.thumbnail?.thumbnails || []
    } else {
      // fallback using meta tags
      const $ = cheerio.load(html)
      channelInfo.title = $('meta[property="og:site_name"]').attr('content') || $('meta[property="og:title"]').attr('content') || ''
      channelInfo.thumbnails = []
    }
  } catch (e) {
    // ignore parse errors
  }
  return channelInfo
}

/* ---------------------------
   Export default (compatibilidad)
   --------------------------- */
export default {
  is_link,
  get_id,
  make_id,
  format_date,
  decode,
  savetube,
  ytmp3,
  ytmp4,
  apimp3,
  apimp4,
  metadata,
  channel,
  search
}
