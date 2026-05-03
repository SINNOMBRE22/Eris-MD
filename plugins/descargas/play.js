/* ══════════════════════════════════════════════════════════════════════════════
   ERIS-MD │ MUSIC PLAYER  ─  Multi-API Race (v3)
   ══════════════════════════════════════════════════════════════════════════════ */

import axios from 'axios';
import yts   from 'yt-search';
import fs    from 'fs';
import path  from 'path';

// ── Constantes ────────────────────────────────────────────────────────────────
const NEWSLETTER_JID  = '120363407502496951@newsletter';
const NEWSLETTER_NAME = 'Eris Service';
const SOURCE_URL      = 'https://github.com/SINNOMBRE22/Eris-MD';
const TIMEOUT_MS      = 25_000;
const YTS_TIMEOUT_MS  = 12_000;

// ── Miniatura ─────────────────────────────────────────────────────────────────
const THUMB = (() => {
    try {
        return fs.readFileSync(path.join(process.cwd(), 'src/imagenes/perfil2.jpeg'));
    } catch {
        return Buffer.alloc(0);
    }
})();

// ── Helper contextInfo ────────────────────────────────────────────────────────
const buildContext = (title = '🌸 ERIS SERVICE 🌸', body = '') => ({
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: NEWSLETTER_JID,
        newsletterName: NEWSLETTER_NAME,
        serverMessageId: -1
    },
    externalAdReply: {
        title,
        body,
        thumbnail: THUMB,
        mediaType: 1,
        renderLargerThumbnail: false,
        sourceUrl: SOURCE_URL
    }
});

// ── APIs de descarga ──────────────────────────────────────────────────────────
const APIS = [

    // ① apicausas
    async (videoUrl) => {
        const { data } = await axios.get('https://rest.apicausas.xyz/api/v1/descargas/youtube', {
            params: { url: videoUrl, type: 'audio', apikey: 'causa-ee5ee31dcfc79da4' },
            timeout: TIMEOUT_MS
        });
        const url = data?.data?.download?.url;
        if (!url) throw new Error('API1: sin URL');
        return { url, source: 'apicausas' };
    },

    // ② GDDLApi
    async (videoUrl) => {
        const { data } = await axios.get('https://gddlapi.vercel.app/dl', {
            params: { url: videoUrl },
            timeout: TIMEOUT_MS
        });
        const url = data?.audio || data?.mp3 || data?.download_url;
        if (!url) throw new Error('API2: sin URL');
        return { url, source: 'gddlapi' };
    },

    // ③ nDownloader
    async (videoUrl) => {
        const { data } = await axios.get('https://ndownloader.xyz/api/yt', {
            params: { url: videoUrl, format: 'mp3' },
            timeout: TIMEOUT_MS
        });
        const url = data?.url || data?.link || data?.download;
        if (!url) throw new Error('API3: sin URL');
        return { url, source: 'ndownloader' };
    },

    // ④ yt-api.p.rapidapi (solo si tienes key, de lo contrario quítala)
    async (videoUrl) => {
        const { data } = await axios.get('https://ytstream-download-youtube-videos.p.rapidapi.com/dl', {
            params: { id: videoUrl.split('v=')[1]?.split('&')[0] || videoUrl },
            headers: {
                'X-RapidAPI-Key': 'PON_TU_RAPIDAPI_KEY_AQUI',
                'X-RapidAPI-Host': 'ytstream-download-youtube-videos.p.rapidapi.com'
            },
            timeout: TIMEOUT_MS
        });
        const formats = data?.formats;
        const url = formats?.['140']?.url || formats?.['251']?.url;
        if (!url) throw new Error('API4: sin URL');
        return { url, source: 'rapidapi' };
    },

    // ⑤ y2mate vía scraping ligero
    async (videoUrl) => {
        const id = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();
        if (!id) throw new Error('API5: sin ID');
        const { data: d1 } = await axios.post(
            'https://www.y2mate.com/mates/analyzeV2/ajax',
            new URLSearchParams({ k_query: videoUrl, k_page: 'home', hl: 'es', q_auto: '0' }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: TIMEOUT_MS }
        );
        const key = d1?.links?.mp3?.mp3128?.k;
        if (!key) throw new Error('API5: sin key');
        const { data: d2 } = await axios.post(
            'https://www.y2mate.com/mates/convertV2/index',
            new URLSearchParams({ vid: id, k: key }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: TIMEOUT_MS }
        );
        const url = d2?.dlink;
        if (!url) throw new Error('API5: sin dlink');
        return { url, source: 'y2mate' };
    },

    // ⑥ API pública de respaldo (yt-api.junn.my.id)
    async (videoUrl) => {
        const { data } = await axios.get('https://yt-api.junn.my.id/dl/mp3', {
            params: { url: videoUrl },
            timeout: TIMEOUT_MS
        });
        const url = data?.result?.url || data?.url;
        if (!url) throw new Error('API6: sin URL');
        return { url, source: 'junapi' };
    },

];

// ── Carrera de APIs ───────────────────────────────────────────────────────────
async function fetchAudioUrl(videoUrl) {
    return new Promise((resolve, reject) => {
        let resolved = false;
        let failures = 0;
        const errors = [];

        for (const apiFn of APIS) {
            apiFn(videoUrl)
                .then(result => {
                    if (!resolved) {
                        resolved = true;
                        resolve(result);
                    }
                })
                .catch(err => {
                    errors.push(err?.message ?? String(err));
                    failures++;
                    if (failures === APIS.length && !resolved) {
                        reject(new Error('No se pudo obtener el audio en este momento.'));
                    }
                });
        }
    });
}

// ── Búsqueda con timeout ──────────────────────────────────────────────────────
async function searchTrack(query) {
    const timer = new Promise((_, rej) =>
        setTimeout(() => rej(new Error('Búsqueda tardó demasiado')), YTS_TIMEOUT_MS)
    );
    const result = await Promise.race([yts(query), timer]);
    return result?.videos?.[0] ?? null;
}

// ── Formato duración ──────────────────────────────────────────────────────────
function fmtDuration(sec = 0) {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

// ── Handler principal ─────────────────────────────────────────────────────────
const handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text?.trim()) {
        return conn.sendMessage(m.chat, {
            text: [
                `🌸 *¿Qué canción quieres escuchar?*`,
                ``,
                `Escribe el nombre del artista o la canción.`,
                ``,
                `> 📌 *Ejemplo:* ${usedPrefix + command} Bad Bunny Tití Me Preguntó`,
            ].join('\n'),
            contextInfo: {
                mentionedJid: [m.sender],
                ...buildContext('🌸 ERIS SERVICE - PLAYER 🌸', `Hola ${m.pushName || 'usuario'} 👋`)
            }
        }, { quoted: m });
    }

    m.react('🔍').catch(() => {});

    try {
        // ① Buscar la canción
        const track = await searchTrack(text.trim());

        if (!track) {
            m.react('❌').catch(() => {});
            return conn.sendMessage(m.chat, {
                text: `❌ *No encontré resultados para:* _${text.trim()}_\n\nIntenta con otro nombre.`,
                contextInfo: buildContext('Sin resultados')
            }, { quoted: m });
        }

        const duration = typeof track.seconds === 'number'
            ? fmtDuration(track.seconds)
            : (track.duration?.timestamp ?? '?:??');

        // ② Notificación + descarga en paralelo
        const [, { url: downloadUrl, source }] = await Promise.all([
            conn.sendMessage(m.chat, {
                text: [
                    `🎵 *${track.title}*`,
                    ``,
                    `👤 *Artista:* ${track.author?.name ?? 'Desconocido'}`,
                    `⏱ *Duración:* ${duration}`,
                    ``,
                    `_Preparando audio…_ ⏳`,
                ].join('\n'),
                contextInfo: buildContext('🌸 REPRODUCIENDO AHORA 🌸', track.title)
            }, { quoted: m }),

            fetchAudioUrl(track.url),
        ]);

        console.log(`[play] ✅ via ${source}: ${track.title}`);
        m.react('🎧').catch(() => {});

        // ③ Enviar audio
        await conn.sendMessage(m.chat, {
            audio    : { url: downloadUrl },
            mimetype : 'audio/mpeg',
            fileName : `${track.title.replace(/[^\w\s\-áéíóúñü]/gi, '')}.mp3`,
            ptt      : false,
            contextInfo: buildContext('🌸 ERIS SERVICE 🌸', track.title)
        }, { quoted: m });

        m.react('✅').catch(() => {});

    } catch (err) {
        console.error('[play] Error:', err?.message ?? err);
        m.react('❌').catch(() => {});
        conn.sendMessage(m.chat, {
            text: [
                `❌ *No pude reproducir la canción.*`,
                ``,
                `_Ocurrió un problema al obtener el audio, intenta de nuevo en un momento._`,
            ].join('\n'),
            contextInfo: buildContext('Error de reproducción')
        }, { quoted: m });
    }
};

handler.help    = ['play <canción>'];
handler.tags    = ['descargas'];
handler.command = ['play', 'musica', 'mp3'];

export default handler;
