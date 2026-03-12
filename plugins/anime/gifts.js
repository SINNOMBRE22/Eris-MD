/* ERIS-MD ANIME INTERACTIVE - FULL VERSION */

import fetch from 'node-fetch'

let handler = async (m, { conn, command }) => {
    // Identificar a quién va dirigida la acción
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    
    // Obtener nombres de forma segura
    let nameWho = await conn.getName(who)
    let nameFrom = await conn.getName(m.sender)

    const apiKey = "causa-ee5ee31dcfc79da4"
    const isNsfw = command === 'waifuh'
    const type = isNsfw ? 'nsfw' : 'sfw'

    // Mapa completo de interacciones y sus textos
    const interactions = {
        'waifu': { action: 'waifu', str: `🌸 Waifu para *${nameFrom}*` },
        'waifuh': { action: 'waifu', str: `🔥 Waifu H para *${nameFrom}*` },
        'neko': { action: 'neko', str: `🐾 Neko para *${nameFrom}*` },
        'shinobu': { action: 'shinobu', str: `🦋 Shinobu para *${nameFrom}*` },
        'megumin': { action: 'megumin', str: `💥 Megumin para *${nameFrom}*` },
        'bully': { action: 'bully', str: `🌸 *${nameFrom}* le hace bullying a *${nameWho}*` },
        'cuddle': { action: 'cuddle', str: `🌸 *${nameFrom}* se acurruca con *${nameWho}*` },
        'cry': { action: 'cry', str: `🌸 *${nameFrom}* está llorando por culpa de *${nameWho}* 😿` },
        'hug': { action: 'hug', str: `🌸 *${nameFrom}* le dio un abrazo a *${nameWho}* 🤗` },
        'awoo': { action: 'awoo', str: `🌸 *${nameFrom}* dice: ¡Awoooo! 🐺` },
        'kiss': { action: 'kiss', str: `💋 *${nameFrom}* besó a *${nameWho}*` },
        'lick': { action: 'lick', str: `🌸 *${nameFrom}* lamió a *${nameWho}*` },
        'pat': { action: 'pat', str: `👋 *${nameFrom}* acaricia a *${nameWho}*` },
        'smug': { action: 'smug', str: `😏 *${nameFrom}* se puso presumido/a` },
        'bonk': { action: 'bonk', str: `🔨 *${nameFrom}* le dio un bonk a *${nameWho}*` },
        'yeet': { action: 'yeet', str: `🌸 *${nameFrom}* mandó a volar a *${nameWho}* 🚀` },
        'blush': { action: 'blush', str: `😳 *${nameFrom}* se sonrojó` },
        'smile': { action: 'smile', str: `🌸 *${nameFrom}* le sonrió a *${nameWho}*` },
        'wave': { action: 'wave', str: `👋 *${nameFrom}* saluda a *${nameWho}*` },
        'highfive': { action: 'highfive', str: `🖐️ *${nameFrom}* chocó los cinco con *${nameWho}*` },
        'handhold': { action: 'handhold', str: `🤝 *${nameFrom}* tomó la mano de *${nameWho}*` },
        'nom': { action: 'nom', str: `🍱 *${nameFrom}* está comiendo...` },
        'bite': { action: 'bite', str: `🦷 *${nameFrom}* mordió a *${nameWho}*` },
        'glomp': { action: 'glomp', str: `🌸 *${nameFrom}* se lanzó sobre *${nameWho}*` },
        'slap': { action: 'slap', str: `🖐️ *${nameFrom}* le dio una bofetada a *${nameWho}*` },
        'kill': { action: 'kill', str: `💀 *${nameFrom}* mató a *${nameWho}*` },
        'kick': { action: 'kick', str: `🦵 *${nameFrom}* le metió una patada a *${nameWho}*` },
        'happy': { action: 'happy', str: `✨ *${nameFrom}* está muy feliz` },
        'wink': { action: 'wink', str: `😉 *${nameFrom}* le guiñó el ojo a *${nameWho}*` },
        'poke': { action: 'poke', str: `🌸 *${nameFrom}* picó a *${nameWho}*` },
        'dance': { action: 'dance', str: `💃 *${nameFrom}* baila con *${nameWho}*` },
        'cringe': { action: 'cringe', str: `😬 *${nameFrom}* siente cringe...` }
    }

    // Aliases para comandos en español
    const aliases = {
        'abrazar': 'hug', 'beso': 'kiss', 'muak': 'kiss', 'lamer': 'lick', 'palmada': 'bonk', 
        'palmadita': 'pat', 'picar': 'poke', 'bailar': 'dance', 'feliz': 'happy', 
        'matar': 'kill', 'patear': 'kick', 'patada': 'kick', 'bofetada': 'slap', 
        'comer': 'nom', 'morder': 'bite', 'mano': 'handhold', '5': 'highfive', 
        'ola': 'wave', 'saludar': 'wave', 'sonreir': 'smile', 'sonrojarse': 'blush', 
        'presumir': 'smug', 'acurrucarse': 'cuddle', 'llorar': 'cry', 'bullying': 'bully'
    }

    const cmd = aliases[command] || command
    const interaction = interactions[cmd]

    if (!interaction) return

    try {
        await m.react('🕓')
        const response = await fetch(`https://rest.apicausas.xyz/api/v1/anime?action=${interaction.action}&type=${type}&apikey=${apiKey}`)
        const json = await response.json()

        if (!json.status || !json.data) throw new Error('API Error')

        const mediaUrl = json.data.url
        const mime = json.data.mimetype
        const resMedia = await fetch(mediaUrl)
        const buffer = await resMedia.buffer()

        if (mime.includes('video') || mime.includes('gif')) {
            await conn.sendMessage(m.chat, { 
                video: buffer, 
                caption: interaction.str, 
                gifPlayback: true,
                mimetype: 'video/mp4',
                mentions: [who] 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: interaction.str, 
                mentions: [who] 
            }, { quoted: m })
        }
        await m.react('✅')

    } catch (e) {
        console.error('Error en Anime Interaction:', e)
        await m.react('❌')
        conn.reply(m.chat, '🌸 Error al procesar la interacción anime.', m)
    }
}

handler.help = [
    'waifu', 'waifuh', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 
    'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 
    'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 
    'wink', 'poke', 'dance', 'cringe', 'abrazar', 'beso', 'muak', 'lamer', 'palmada', 
    'palmadita', 'picar', 'bailar', 'feliz', 'matar', 'patear', 'patada', 'bofetada', 
    'comer', 'morder', 'mano', '5', 'ola', 'saludar', 'sonreir', 'sonrojarse', 
    'presumir', 'acurrucarse', 'llorar', 'bullying'
]
handler.tags = ['anime']
handler.command = [
    'waifu', 'waifuh', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 
    'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 
    'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 
    'wink', 'poke', 'dance', 'cringe', 'abrazar', 'beso', 'muak', 'lamer', 'palmada', 
    'palmadita', 'picar', 'bailar', 'feliz', 'matar', 'patear', 'patada', 'bofetada', 
    'comer', 'morder', 'mano', '5', 'ola', 'saludar', 'sonreir', 'sonrojarse', 
    'presumir', 'acurrucarse', 'llorar', 'bullying'
]
handler.group = true

export default handler
