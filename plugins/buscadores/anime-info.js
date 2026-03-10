/*
- Coded by I'm Fz
- https/Github.com/FzTeis
- Enhanced by Ellen Joe's Service
*/

import axios from 'axios';
import cheerio from 'cheerio';

// --- Constantes y Configuración de Transmisión ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';

// Solución al ReferenceError: Definición de variables globales
const defaultIcon = 'https://qu.ax/ZSkv.jpg'; 
const defaultRedes = 'https://github.com/FzTeis';

// Function to shorten URLs
async function getShortUrl(longUrl) {
    try {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        return response.data;
    } catch (error) {
        return longUrl;
    }
}

// Function to get anime episodes (TioAnime)
async function getAnimeEpisodes(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const script = $('script').filter((i, el) => {
            const text = $(el).text();
            return text.includes('var anime_info') && text.includes('var episodes');
        });

        if (script.length === 0) {
            throw new Error('No se encontró la información. ¿Es un link válido de TioAnime?');
        }

        const scriptText = script.html();
        const animeInfoMatch = scriptText.match(/var anime_info = (\[.*?\]);/);
        const episodesMatch = scriptText.match(/var episodes = (\[.*?\]);/);

        if (!animeInfoMatch || !episodesMatch) {
            throw new Error('Estructura de la página no reconocida.');
        }

        const animeInfo = JSON.parse(animeInfoMatch[1]);
        const episodes = JSON.parse(episodesMatch[1]);
        const animeId = animeInfo[1];

        const episodeUrls = episodes.reverse().map((episode, index) => ({
            [`Episodio ${index + 1}`]: `https://tioanime.com/ver/${animeId}-${episode}`
        }));

        const nextEpisodeElement = $('span.next-episode span');
        const nextEpisode = nextEpisodeElement.text().trim() || 'Finalizado / No anunciado';

        return {
            proximo_episodio: nextEpisode,
            episodios: episodeUrls
        };
    } catch (error) {
        return { error: `⚠️ *Error:* ${error.message}` };
    }
}

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
    const name = conn.getName(m.sender);

    const contextInfo = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName,
            serverMessageId: -1
        },
        externalAdReply: {
            title: 'Ellen Joe: Pista localizada. 🦈',
            body: `Analizando anime para Proxy ${name}...`,
            thumbnailUrl: defaultIcon, // Corregido
            sourceUrl: defaultRedes, // Corregido
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    if (!args[0]) {
        return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Pega el link de un anime de TioAnime.`, m, { contextInfo, quoted: m });
    }

    m.react('🔄');
    
    try {
        let data = await getAnimeEpisodes(args[0]);

        if (data.error) {
            await m.react('❌');
            return conn.reply(m.chat, data.error, m, { contextInfo, quoted: m });
        }

        let messageText = `╭━━━━[ 𝙰𝚗𝚒𝚖𝚎 𝙸𝚗𝚏𝚘 ]━━━━⬣\n`;

        if (data.episodios && data.episodios.length > 0) {
            messageText += `• *Lista de Episodios:* \n`;
            // Limitamos a los últimos 10 para no saturar el mensaje si es muy largo
            const lastEpisodes = data.episodios.slice(0, 10);
            for (const episode of lastEpisodes) {
                const [key, url] = Object.entries(episode)[0];
                messageText += `  ${key}: 🔗 ${url}\n`;
            }
        } else {
            messageText += `• No se encontraron episodios.\n`;
        }

        messageText += `\n📺 *Próximo:* ${data.proximo_episodio}\n╰━━━━━━━━━━━━━━━━━━━━━━━⬣`;

        await conn.sendMessage(m.chat, { text: messageText }, { quoted: m });
        await m.react('✅');

    } catch (error) {
        await m.react('❌');
        conn.reply(m.chat, `⚠️ *Anomalía:* ${error.message}`, m, { contextInfo, quoted: m });
    }
}

handler.help = ['animeinfo <url>'];
handler.command = ['animeinfo', 'animei'];
handler.tags = ['buscadores'];

// --- Ajustes de Limitación ---
handler.group = true;    // Solo en grupos
handler.premium = false; // Para todos
handler.register = false;// No requiere registro

export default handler;
