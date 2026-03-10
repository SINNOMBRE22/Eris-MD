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

// Links por defecto para evitar el Error de "icons is not defined"
const defaultIcon = 'https://qu.ax/ZSkv.jpg'; // Cambia por tu imagen
const defaultRedes = 'https://github.com/FzTeis';

// Function to shorten URLs
async function acc(longUrl) {
    try {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        return response.data;
    } catch (error) {
        return longUrl;
    }
}

// Function to get download links
const getDownloadLinks = async (url) => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const downloads = {};
        $('table.table-downloads tbody tr').each((_, element) => {
            const server = $(element).find('td:nth-child(2)').text().trim();
            const link = $(element).find('td:nth-child(4) a').attr('href');
            if (server && link) {
                downloads[server] = link;
            }
        });
        return downloads;
    } catch (error) {
        return { error: 'No se pudieron recuperar los enlaces.' };
    }
};

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
            body: `Procesando solicitud para el/la Proxy ${name}...`,
            thumbnailUrl: defaultIcon, // Corregido: ya no dará ReferenceError
            sourceUrl: defaultRedes,
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    if (!args[0]) {
        return conn.reply(
            m.chat,
            `🦈 *Rastro frío, Proxy ${name}.* Necesito la URL del anime.\n\n_Ejemplo: ${usedPrefix + command} [link_de_anime]_`,
            m,
            { contextInfo, quoted: m }
        );
    }

    m.react('🔄');
    
    try {
        const links = await getDownloadLinks(args[0]);

        if (links.error) {
            await m.react('❌');
            return conn.reply(m.chat, `❌ *Fallo en la extracción, Proxy ${name}.*\nVerifica el enlace.`, m, { contextInfo, quoted: m });
        }

        let messageText = `╭━━━━[ 𝙰𝚗𝚒𝚖𝚎 𝙳𝚎𝚌𝚘𝚍𝚎𝚍 ]━━━━⬣\n`;
        let linkCount = 0;

        for (const [server, link] of Object.entries(links)) {
            if (link) {
                messageText += `💻 *Servidor:* ${server}\n  🔗 *\`Enlace:\`* ${link}\n─ׄ─ׄ─⭒─ׄ─ׅ─ׄ⭒─ׄ─ׄ─\n`;
                linkCount++;
            }
        }

        if (linkCount === 0) {
            await m.react('❌');
            return conn.reply(m.chat, `❌ No se encontraron enlaces válidos.`, m, { contextInfo, quoted: m });
        }

        messageText += `\n*Nota:* Usa los enlaces con precaución.\n╰━━━━━━━━━━━━━━━━━━━━━━━⬣`;

        await conn.sendMessage(m.chat, { text: messageText }, { quoted: m });
        await m.react('✅');

    } catch (error) {
        await m.react('❌');
        conn.reply(m.chat, `⚠️ *Error:* ${error.message}`, m, { contextInfo, quoted: m });
    }
}

handler.help = ['animedl <url>'];
handler.command = ['animedl', 'animelinks'];
handler.tags = ['descargas'];

// --- Ajustes de Limitación ---
handler.group = true;    // Solo funciona en grupos

export default handler;
