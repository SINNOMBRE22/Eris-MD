/* 🦈 ANTI-NSFW - ERIS-MD SYSTEM 🦈 */
/* Detección local por análisis de tonos de piel — sin API externa */
/* Compatible con jimp@0.16.x y fork Baileys de Carlos */

import Jimp from 'jimp'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

// ── Configuración ─────────────────────────────────────────────────────────────
const SKIN_THRESHOLD = 0.40

// ── Detectar tono de piel en un píxel ────────────────────────────────────────
function isSkinPixel(r, g, b) {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    return (
        r > 95 && g > 40 && b > 20 &&
        max - min > 15 &&
        Math.abs(r - g) > 15 &&
        r > g && r > b &&
        (r > 220 ? g > 210 : true)
    )
}

// ── Analizar buffer de imagen ─────────────────────────────────────────────────
async function checkNSFW(buffer) {
    const image = await Jimp.read(buffer)
    image.resize(100, 100)
    const { data, width, height } = image.bitmap
    let skinPixels = 0
    let totalPixels = 0
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4
            const r = data[idx]
            const g = data[idx + 1]
            const b = data[idx + 2]
            const a = data[idx + 3]
            if (a < 128) continue
            totalPixels++
            if (isSkinPixel(r, g, b)) skinPixels++
        }
    }
    const ratio = totalPixels > 0 ? skinPixels / totalPixels : 0
    return { isNSFW: ratio >= SKIN_THRESHOLD, score: ratio }
}

// ── Handler ───────────────────────────────────────────────────────────────────
let handler = async (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) => {
    // Solo grupos
    if (!m.isGroup) return

    // Solo imágenes
    const msgType = Object.keys(m.message || {})[0]
    const isImage = msgType === 'imageMessage' ||
        (msgType === 'viewOnceMessage' &&
         Object.keys(m.message?.viewOnceMessage?.message || {})[0] === 'imageMessage')
    if (!isImage) return

    // Admins, dueños y el bot son inmunes
    if (isAdmin || isOwner || isROwner || m.fromMe) return

    // Verificar si está activado en este grupo
    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat?.antiNsfw) return

    try {
        const buffer = await downloadMediaMessage(
            m, 'buffer', {},
            { logger: console, reuploadRequest: conn.updateMediaMessage }
        )
        if (!buffer || buffer.length === 0) return

        const { isNSFW, score } = await checkNSFW(buffer)
        if (!isNSFW) return

        console.log(`[ANTI-NSFW] Detectado | ${m.sender} | score: ${(score * 100).toFixed(0)}%`)

        const user = `@${m.sender.split('@')[0]}`

        if (!isBotAdmin) {
            await conn.sendMessage(m.chat, {
                text: `> ⊰🦈⊱ Detecté contenido sospechoso de ${user}.\n\n➥ Qué lástima que no soy administradora para borrarlo y sacarlo a patadas. Háganme admin si quieren que trabaje.`,
                mentions: [m.sender]
            }, { quoted: m })
            return
        }

        // 1. ELIMINAR
        await conn.sendMessage(m.chat, { delete: m.key })

        // 2. AVISO
        await conn.sendMessage(m.chat, {
            text: `> ⊰🌸⊱ *IMAGEN INAPROPIADA DETECTADA*\n\n${user} envió contenido explícito.\n➥ Hora de sacar la basura. 🗑️\n\n_Confianza: ${(score * 100).toFixed(0)}%_`,
            mentions: [m.sender]
        })

        // 3. EXPULSAR
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

    } catch (e) {
        console.error('❌ Error en Anti-NSFW:', e.message)
    }
}

// ✅ Export correcto — NO usa "before", usa handler normal
handler.all = true  // se ejecuta en todos los mensajes sin necesitar comando
export default handler
