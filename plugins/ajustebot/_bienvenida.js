/* 🦈 BIENVENIDA Y DESPEDIDA - ERIS-MD SYSTEM (PURIFICADOR DE IDs) 🦈 */

import { WAMessageStubType } from '@whiskeysockets/baileys'
import { readFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'

const BASE_PATH = process.cwd();
const IMAGE_WELCOME = join(BASE_PATH, 'src', 'imagenes', 'perfil2.jpeg');
const IMAGE_LEAVE_THUMB = join(BASE_PATH, 'src', 'imagenes', 'despedida.jpeg');
const AUDIO_MP3 = join(BASE_PATH, 'src', 'audio', 'despedida.mp3');
const AUDIO_OGG = join(BASE_PATH, 'src', 'audio', 'temp_despedida.ogg');

export async function before(m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return true;

    let chat = global.db.data.chats[m.chat];
    if (!chat?.welcome) return true; 

    // 1. Extraemos el usuario (Si no está en parámetros, lo sacamos del sender)
    let rawUserId = m.messageStubParameters?.[0];
    if (!rawUserId) rawUserId = m.sender;
    if (!rawUserId) return true;

    // 2. 🔥 EL PURIFICADOR DE PUERTOS 🔥 (La solución a los números falsos)
    let jid = rawUserId;
    if (jid.includes(':')) {
        // Cortamos la basura del puerto (ej. 52123:15@... -> 52123@...)
        jid = jid.split(':')[0] + '@s.whatsapp.net';
    } else if (!jid.includes('@')) {
        jid = jid + '@s.whatsapp.net';
    }

    const userNumber = jid.split('@')[0];
    
    // 3. Obtenemos el nombre correctamente
    let pushName = await conn.getName(jid);
    if (!pushName || pushName === jid) {
        pushName = `+${userNumber}`;
    }

    const groupName = groupMetadata.subject;
    const groupSize = participants.length;

    // ==========================================================
    // EVENTO: BIENVENIDA
    // ==========================================================
    const welcomeStubs = [WAMessageStubType.GROUP_PARTICIPANT_ADD, 27, 31];
    if (welcomeStubs.includes(m.messageStubType)) {

        let imgBuffer;
        try { imgBuffer = readFileSync(IMAGE_WELCOME); } catch { imgBuffer = Buffer.alloc(0); }

        const welcomeText = `> ꒰🦈꒱ ¡Oh! Un Nuevo Juguete Se Unió, A Divertirme.\n\nEsperamos Todos Que Te Sientas Cómodo Aquí, Aunque Recuerda Que Solo Eres Un Integrante Más.\n\n∫ 👥 *Miembros:* ${groupSize}\n∫ 🆔 *ID:* @${userNumber}\n\n> ꒰💡꒱ ¿Necesitas Un Manual De Instrucciones? Usa .help`.trim();

        await conn.sendMessage(m.chat, { 
            text: welcomeText, 
            mentions: [jid], 
            contextInfo: { 
                mentionedJid: [jid],
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
                    renderLargerThumbnail: true
                }
            } 
        });
        return true;
    }

    // ==========================================================
    // EVENTO: DESPEDIDA
    // ==========================================================
    // Se agregan los códigos 28 y 32 por seguridad en Baileys
    const leaveStubs = [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE, 28, 32];
    if (leaveStubs.includes(m.messageStubType)) {

        const byeText = `> ⊰🦈⊱ Oh, Se Fue @${userNumber}. Pff, Que Pérdida De Tiempo Fue Esa.\n\n➯ Que Bueno Que Te Fuiste, Se Le Dará Tu Lugar A Otra Persona Que Si Lo Valore.\n\n> ⊰🦈⊱ Y Eso Es Todo Por Mi Parte, No Me Molestes.`.trim();

        await conn.sendMessage(m.chat, { 
            text: byeText, 
            mentions: [jid],
            contextInfo: { mentionedJid: [jid] } 
        });

        if (existsSync(AUDIO_MP3)) {
            try {
                await new Promise((resolve, reject) => {
                    exec(`ffmpeg -y -i "${AUDIO_MP3}" -c:a libopus "${AUDIO_OGG}"`, (error) => {
                        if (error) reject(error); else resolve();
                    });
                });

                let thumbBuffer;
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
                            body: `${pushName} (@${userNumber}) Se Fue ALV 😂`,
                            thumbnail: thumbBuffer, 
                            mediaType: 1,
                            renderLargerThumbnail: false, 
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
