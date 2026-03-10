/* 🦈 ANTI-DELETE - ERIS-MD SYSTEM (DETECTIVE EDITION) 🦈 */

import { getContentType, generateForwardMessageContent, generateWAMessageFromContent } from '@whiskeysockets/baileys';

global.delete = global.delete || [];

export async function before(m, { conn, isAdmin }) {
    if (!m.isGroup) return;
    if (isAdmin) return; 
    if (m.key.fromMe) return;

    let chat = global.db.data.chats[m.chat];
    if (!chat?.delete) return; // Obedece a: .activar antieliminar

    if (global.delete.length > 500) global.delete = [];

    // Guardar Mensajes En Memoria
    if (m.type !== 'protocolMessage' && m.key && m.message) {
        global.delete.push({ 
            key: m.key, 
            message: m.message,
            timestamp: new Date() // Guardamos La Hora De Envío
        });
    }

    // Detectar Eliminación
    if (m?.message?.protocolMessage) {
        let msg = global.delete.find((index) => index.key.id === m.message.protocolMessage.key.id);

        if (msg) {
            const time = msg.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const user = `@${msg.key.participant.split('@')[0]}`;
            
            // Texto Estilizado Con Info Del Usuario
            let aviso = `> ⊰🦈⊱ ¡Oh! El Usuario ${user} Eliminó Un Mensaje.\n\n⌚ *Hora De Envío:* ${time}\n➥ *Eris-MD* Lo Recuperó Para Ti.`.trim();
            
            let quoted = {
                key: msg.key,
                message: {
                    extendedTextMessage: { text: aviso, mentions: [msg.key.participant] }
                }
            };

            await sendMessageForward(msg, {
                client: conn,
                from: m.chat,
                quoted: quoted
            });

            let index = global.delete.indexOf(msg);
            if (index !== -1) global.delete.splice(index, 1);
        }
    }
}

async function sendMessageForward(msg, { client, from, quoted }) {
    let type = getContentType(msg.message);
    let content = await generateForwardMessageContent(msg, { forwardingScore: 1 });
    let contentType = getContentType(content);

    content[contentType].contextInfo = {
        ...msg.message[type].contextInfo,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363407502496951@newsletter',
            newsletterName: '✨ Eris-MD Oficial'
        }
    };

    let waMsg = await generateWAMessageFromContent(from, content, {
        userJid: client.user.id,
        quoted: quoted
    });

    return await client.relayMessage(from, waMsg.message, { messageId: waMsg.key.id });
}
