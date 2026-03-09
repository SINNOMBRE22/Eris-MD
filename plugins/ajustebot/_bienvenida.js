/* 🦈 BIENVENIDA Y DESPEDIDA - ERIS-MD (MINIATURA LOCAL) 🦈 */

import { WAMessageStubType } from '@whiskeysockets/baileys'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'

// --- CONFIGURACIÓN DE RUTAS ---
const BASE_PATH = process.cwd();
const IMAGE_WELCOME = join(BASE_PATH, 'src', 'imágenes', 'perfil2.jpg');
const IMAGE_LEAVE_THUMB = join(BASE_PATH, 'src', 'imagenes', 'despedida.jpeg');
const AUDIO_MP3 = join(BASE_PATH, 'src', 'audio', 'despedida.mp3');
const AUDIO_OGG = join(BASE_PATH, 'src', 'audio', 'temp_despedida.ogg');

export async function before(m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return true;

    const userId = m.messageStubParameters?.[0];
    if (!userId) return true;

    const jid = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`;
    const pushName = conn.getName(jid) || 'Recluta';
    const groupName = groupMetadata.subject;
    const groupSize = participants.length;

    // --- 1. EVENTO: BIENVENIDA ---
    const welcomeStubs = [WAMessageStubType.GROUP_PARTICIPANT_ADD, 27, 31];
    if (welcomeStubs.includes(m.messageStubType)) {
        let img;
        try { img = readFileSync(IMAGE_WELCOME); } catch { img = { url: 'https://tinyurl.com/SinNombre-chan' }; }

        const welcomeText = `
> ꒰🦈꒱ ¡Oh! Un Nuevo Juguete Se Unió, A Divertirme.
➥ Bienvenida/o A *${groupName}*

Esperamos Todos Que Te Sientas Cómodo Aquí, Aunque Recuerda Que Solo Eres Un Integrante Más.

∫ 👥 *Miembros:* ${groupSize}
∫ 🆔 *ID:* @${jid.split('@')[0]}

> ꒰💡꒱ ¿Necesitas Un Manual De Instrucciones? Usa .help`.trim();

        await conn.sendMessage(m.chat, { 
            image: img, 
            caption: welcomeText, 
            mentions: [jid],
            contextInfo: { 
                isForwarded: true,
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: '120363418071540900@newsletter', 
                    newsletterName: '✨ Eris-MD Oficial' 
                } 
            } 
        }, { quoted: m });
        return true;
    }

    // --- 2. EVENTO: DESPEDIDA (AUDIO CON MINIATURA LOCAL) ---
    const leaveStubs = [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE, 32];
    if (leaveStubs.includes(m.messageStubType)) {
        
        const byeText = `
> ⊰🦈⊱ Oh, Se Fue. Pff, Que Pérdida De Tiempo Fue Esa. 

➯ Que Bueno Que Te Fuiste, Se Le Dará Tu Lugar A Otra Persona Que Si Lo Valore.

> ⊰🦈⊱ Y Eso Es Todo Por Mi Parte, No Me Molestes.`.trim();

        await conn.sendMessage(m.chat, { text: byeText, mentions: [jid] }, { quoted: m });

        if (existsSync(AUDIO_MP3)) {
            try {
                // Convertir audio
                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -y -i "${AUDIO_MP3}" -c:a libopus "${AUDIO_OGG}"`, (error) => {
                        if (error) reject(error); else resolve();
                    });
                });

                const audioBuffer = readFileSync(AUDIO_OGG);
                
                // Cargar miniatura local
                let thumbBuffer;
                try {
                    thumbBuffer = readFileSync(IMAGE_LEAVE_THUMB);
                } catch {
                    thumbBuffer = { url: 'https://tinyurl.com/SinNombre-chan' }; // Fallback
                }

                await conn.sendMessage(m.chat, {
                    audio: audioBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    contextInfo: {
                        mentionedJid: [jid],
                        externalAdReply: {
                            title: 'Despedida De Un Guerrero | Eris-MD',
                            body: `${pushName} Se Fue ALV 😂`,
                            sourceUrl: 'https://api.sinnombre.dev',
                            thumbnail: thumbBuffer, // <-- AQUÍ SE USA TU IMAGEN LOCAL
                            mediaType: 1,
                            showAdAttribution: true
                        }
                    }
                }, { mentions: [jid] });

                if (existsSync(AUDIO_OGG)) unlinkSync(AUDIO_OGG);
            } catch (e) {
                console.error('❌ Error En Despedida:', e);
            }
        }
        return true;
    }

    return true;
}
