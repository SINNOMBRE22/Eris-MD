/* ERIS-MD YOUTUBE PLAYER - BOT IDENTITY + VISUAL HELP */

import axios from 'axios';
import yts from "yt-search";
import fs from 'fs';
import path from 'path';

const API_BASE = 'https://rest.apicausas.xyz/api/v1/descargas/youtube';
const API_KEY = 'causa-ee5ee31dcfc79da4';
const newsletterJid = '120363407502496951@newsletter';
const newsletterName = 'Eris Service';
const redes = 'https://github.com/SINNOMBRE22/Eris-MD';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    
    // 1. Cargar miniatura oficial del bot
    let thumb;
    try {
        const imgPath = path.join(process.cwd(), 'src/imagenes/perfil2.jpeg');
        thumb = fs.readFileSync(imgPath);
    } catch {
        thumb = Buffer.alloc(0);
    }

    // --- MENSAJE DE AYUDA CON MINIATURA (SI NO HAY TEXTO) ---
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `🌸 *¿Qué canción quieres escuchar?*\n\nIndica el nombre de la pista para iniciar la búsqueda.\n> *Ejemplo:* ${usedPrefix + command} Miranda Don`,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
                externalAdReply: {
                    title: `🌸 ERIS SERVICE - PLAYER 🌸`,
                    body: `Hola ${m.pushName || 'Proxy'}, te falta el nombre.`,
                    thumbnail: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    sourceUrl: redes
                }
            }
        }, { quoted: m });
    }

    await m.react('🔍');
    
    try {
        const searchResult = await yts(text);
        const video = searchResult.videos?.[0];

        if (!video) {
            await m.react('❌');
            return conn.reply(m.chat, `🌸 *Sin resultados para:* ${text}`, m);
        }

        // 2. Notificación de descarga con miniatura del bot
        await conn.sendMessage(m.chat, {
            text: `🎧 *Descargando:* ${video.title}`,
            contextInfo: {
                externalAdReply: {
                    title: `🌸 REPRODUCIENDO AHORA 🌸`,
                    body: video.title,
                    thumbnail: thumb, 
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    sourceUrl: redes
                }
            }
        }, { quoted: m });

        await m.react('🎧');

        const { data: res } = await axios.get(`${API_BASE}?url=${encodeURIComponent(video.url)}&type=audio&apikey=${API_KEY}`);

        if (res.status && res.data.download.url) {
            await conn.sendMessage(m.chat, { 
                audio: { url: res.data.download.url }, 
                mimetype: "audio/mpeg", 
                fileName: `${video.title}.mp3` 
            }, { quoted: m });
            
            await m.react('✅');
        } else {
            throw new Error();
        }

    } catch (error) {
        await m.react('❌');
        conn.reply(m.chat, `🌸 *Error:* No pude procesar el audio.`, m);
    }
}

handler.command = ['play', 'musica'];
export default handler;

