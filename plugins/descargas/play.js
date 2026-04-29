/* ERIS-MD YOUTUBE PLAYER - MULTI-API RACE (más rápido) */

import axios from 'axios';
import yts from "yt-search";
import fs from 'fs';
import path from 'path';

const newsletterJid  = '120363407502496951@newsletter';
const newsletterName = 'Eris Service';
const redes = 'https://github.com/SINNOMBRE22/Eris-MD';

// ── Miniatura cargada una vez al arrancar ────────────────────────────────────
let thumb = Buffer.alloc(0);
try {
    thumb = fs.readFileSync(path.join(process.cwd(), 'src/imagenes/perfil2.jpeg'));
} catch { /* sin miniatura */ }

// ── Lista de APIs — agrega o quita las que quieras ──────────────────────────
const APIS = [
    // API principal tuya
    (videoUrl) => axios.get(
        `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&apikey=causa-ee5ee31dcfc79da4`,
        { timeout: 20_000 }
    ).then(r => {
        const url = r.data?.data?.download?.url;
        if (!url) throw new Error('API1: sin URL');
        return url;
    }),

    // API pública alternativa #1
    (videoUrl) => axios.get(
        `https://api.fabdl.com/youtube/get?url=${encodeURIComponent(videoUrl)}`,
        { timeout: 20_000 }
    ).then(async r => {
        const { gid, pid } = r.data?.result || {};
        if (!gid || !pid) throw new Error('API2: sin gid/pid');
        const conv = await axios.get(
            `https://api.fabdl.com/youtube/mp3/${gid}/${pid}`,
            { timeout: 20_000 }
        );
        const url = conv.data?.result?.download_url;
        if (!url) throw new Error('API2: sin download_url');
        return url;
    }),

    // API pública alternativa #2
    (videoUrl) => axios.get(
        `https://api.cobalt.tools/api/json`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            data: { url: videoUrl, isAudioOnly: true, aFormat: 'mp3' },
            timeout: 20_000
        }
    ).then(r => {
        const url = r.data?.url;
        if (!url) throw new Error('API3: sin URL');
        return url;
    }),
];

// ── Corre todas las APIs en paralelo, gana la primera que resuelva ──────────
async function fetchAudioUrl(videoUrl) {
    return new Promise((resolve, reject) => {
        let settled = false;
        let failed  = 0;

        APIS.forEach(apiFn => {
            apiFn(videoUrl)
                .then(url => {
                    if (!settled) {
                        settled = true;
                        resolve(url);
                    }
                })
                .catch(() => {
                    failed++;
                    if (failed === APIS.length && !settled) {
                        reject(new Error('Todas las APIs fallaron'));
                    }
                });
        });
    });
}

// ── Handler principal ────────────────────────────────────────────────────────
let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `🌸 *¿Qué canción quieres escuchar?*\n\nIndica el nombre de la pista para iniciar la búsqueda.\n> *Ejemplo:* ${usedPrefix + command} Miranda Don`,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
                externalAdReply: {
                    title: '🌸 ERIS SERVICE - PLAYER 🌸',
                    body: `Hola ${m.pushName || 'Proxy'}, te falta el nombre.`,
                    thumbnail: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    sourceUrl: redes
                }
            }
        }, { quoted: m });
    }

    m.react('🔍').catch(() => {});

    try {
        // ── 1. Buscar video ──────────────────────────────────────────────────
        const searchResult = await Promise.race([
            yts(text),
            new Promise((_, rej) => setTimeout(() => rej(new Error('yts timeout')), 10_000))
        ]);

        const video = searchResult.videos?.[0];
        if (!video) {
            m.react('❌').catch(() => {});
            return conn.reply(m.chat, `🌸 *Sin resultados para:* ${text}`, m);
        }

        // ── 2. Notificación + carrera de APIs en paralelo ────────────────────
        const [, downloadUrl] = await Promise.all([
            conn.sendMessage(m.chat, {
                text: `🎧 *Descargando:* ${video.title}`,
                contextInfo: {
                    externalAdReply: {
                        title: '🌸 REPRODUCIENDO AHORA 🌸',
                        body: video.title,
                        thumbnail: thumb,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        sourceUrl: redes
                    }
                }
            }, { quoted: m }),

            fetchAudioUrl(video.url)   // 🏁 Todas las APIs corriendo al mismo tiempo
        ]);

        m.react('🎧').catch(() => {});

        // ── 3. Enviar audio por URL directa (streaming, sin buffer) ──────────
        await conn.sendMessage(m.chat, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false
        }, { quoted: m });

        m.react('✅').catch(() => {});

    } catch (error) {
        console.error('[play]', error?.message || error);
        m.react('❌').catch(() => {});
        conn.reply(
            m.chat,
            `🌸 *Error:* No pude procesar el audio.\n_${error?.message || 'Intenta de nuevo'}_`,
            m
        );
    }
};

handler.help    = ['play'];
handler.tags    = ['descargas'];
handler.command = ['play', 'musica'];
export default handler;
