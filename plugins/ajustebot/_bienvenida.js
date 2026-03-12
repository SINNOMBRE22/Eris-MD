/* 🦈 BIENVENIDA Y DESPEDIDA - ERIS-MD SYSTEM (CLEAN ICON EDITION) 🦈 */

import { WAMessageStubType } from '@whiskeysockets/baileys'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'

// --- CONFIGURACIÓN DE RUTAS ---
const BASE_PATH = process.cwd();
// Imagen para bienvenida (Banner Grande)
const IMAGE_WELCOME = join(BASE_PATH, 'src', 'imagenes', 'perfil2.jpeg');
// Imagen diferente para despedida (Cuadro Pequeño)
const IMAGE_LEAVE_THUMB = join(BASE_PATH, 'src', 'imagenes', 'despedida.jpeg');
const AUDIO_MP3 = join(BASE_PATH, 'src', 'audio', 'despedida.mp3');
const AUDIO_OGG = join(BASE_PATH, 'src', 'audio', 'temp_despedida.ogg');

export async function before(m, { conn, participants, groupMetadata }) {
    // 1. VALIDACIONES INICIALES
    if (!m.messageStubType || !m.isGroup) return true;

    // 2. REVISAR SI LA BIENVENIDA ESTÁ ACTIVADA EN LA BASE DE DATOS
    let chat = global.db.data.chats[m.chat];
    if (!chat?.welcome) return true; 

    const userId = m.messageStubParameters?.[0];
    if (!userId) return true;

    const jid = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`;
    const pushName = conn.getName(jid) || 'Recluta';
    const groupName = groupMetadata.subject;
    const groupSize = participants.length;

    // --- 3. EVENTO: BIENVENIDA (ESTILO ÍCONO / AD-REPLY LIMPIO) ---
    const welcomeStubs = [WAMessageStubType.GROUP_PARTICIPANT_ADD, 27, 31];
    if (welcomeStubs.includes(m.messageStubType)) {
        
        let imgBuffer;
        try { 
            imgBuffer = readFileSync(IMAGE_WELCOME); 
        } catch { 
            imgBuffer = Buffer.alloc(0);
        }

        const welcomeText = `> ꒰🦈꒱ ¡Oh! Un Nuevo Juguete Se Unió, A Divertirme.

Esperamos Todos Que Te Sientas Cómodo Aquí, Aunque Recuerda Que Solo Eres Un Integrante Más.

∫ 👥 *Miembros:* ${groupSize}
∫ 🆔 *ID:* @${jid.split('@')[0]}

> ꒰💡꒱ ¿Necesitas Un Manual De Instrucciones? Usa .help`.trim();

        await conn.sendMessage(m.chat, { 
            text: welcomeText, 
            mentions: [jid],
            contextInfo: { 
                isForwarded: true,
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: '120363407502496951@newsletter', 
                    newsletterName: '✨ Eris-MD Oficial' 
                },
                externalAdReply: {
                    title: `¡Bienvenido/a a ${groupName}!`,
                    body: `Usuario: ${pushName}`,
                    thumbnail: imgBuffer, 
                    mediaType: 1,
                    renderLargerThumbnail: true // true = Banner grande para la bienvenida
                }
            } 
        });
        return true;
    }

    // --- 4. EVENTO: DESPEDIDA ---
    const leaveStubs = [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE, 32];
    if (leaveStubs.includes(m.messageStubType)) {

        const byeText = `> ⊰🦈⊱ Oh, Se Fue. Pff, Que Pérdida De Tiempo Fue Esa. 

➯ Que Bueno Que Te Fuiste, Se Le Dará Tu Lugar A Otra Persona Que Si Lo Valore.

> ⊰🦈⊱ Y Eso Es Todo Por Mi Parte, No Me Molestes.`.trim();

        await conn.sendMessage(m.chat, { text: byeText, mentions: [jid] });

        if (existsSync(AUDIO_MP3)) {
            try {
                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -y -i "${AUDIO_MP3}" -c:a libopus "${AUDIO_OGG}"`, (error) => {
                        if (error) reject(error); else resolve();
                    });
                });

                let thumbBuffer;
                // Aquí usamos la imagen de despedida (despedida.jpeg)
                try { thumbBuffer = readFileSync(IMAGE_LEAVE_THUMB); } catch { thumbBuffer = Buffer.alloc(0); }

                const audioBuffer = readFileSync(AUDIO_OGG);

                await conn.sendMessage(m.chat, {
                    audio: audioBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    contextInfo: {
                        mentionedJid: [jid],
                        externalAdReply: {
                            title: 'Despedida De Un Guerrero | Eris-MD',
                            body: `${pushName} Se Fue ALV 😂`,
                            thumbnail: thumbBuffer, 
                            mediaType: 1,
                            renderLargerThumbnail: false, // false = Cuadro pequeño al lado del audio
                            showAdAttribution: true
                        }
                    }
                });

                if (existsSync(AUDIO_OGG)) unlinkSync(AUDIO_OGG);
            } catch (e) {
                console.error('❌ Error En Despedida Eris-MD:', e);
            }
        }
        return true;
    }

    return true;
}
