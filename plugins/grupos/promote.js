/* COMANDO: PROMOVER ADMIN - ERIS-MD */

import fs from 'fs'
import path from 'path'

var handler = async (m, { conn, text, groupMetadata, command }) => {
    let thumb
    try {
        const imgPath = path.join(process.cwd(), 'src/imagenes/perfil2.jpeg')
        thumb = fs.readFileSync(imgPath)
    } catch {
        thumb = Buffer.alloc(0)
    }

    // 1. OBTENER USUARIO
    let user
    const mentionedJid =
        m.mentionedJid?.length > 0
            ? m.mentionedJid
            : m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    if (mentionedJid.length > 0) {
        user = mentionedJid[0]
    } else if (m.quoted?.sender) {
        user = m.quoted.sender
    } else if (text) {
        let target = text.replace(/[^0-9]/g, '')
        if (target.length >= 10) user = target + '@s.whatsapp.net'
    }

    if (!user) {
        return m.reply('✦ *ERROR DE PARAMETROS*\n\n✧ Accion:\n➤ Debes mencionar (@), citar o escribir el numero del usuario para promoverlo.')
    }

    // 2. VALIDACIONES
    const ownerGroup = groupMetadata.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
    const botOwner = (global.owner && global.owner[0] && global.owner[0][0]) ? global.owner[0][0] + '@s.whatsapp.net' : ''

    if ([conn.user.jid, ownerGroup, botOwner].includes(user)) {
        return m.reply('✦ *AVISO DEL SISTEMA*\n\n✧ Estado:\n➤ No tengo permitido promover a este usuario (Bot/Owner).')
    }

    // 3. EJECUTAR PROMOCION
    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote')

        const textMessage = [
            '✦ *PROMOCION DE ADMIN*',
            '',
            '✧ Grupo:',
            '➤ ' + groupMetadata.subject,
            '',
            '✧ Usuario Promovido:',
            '➤ @' + user.split('@')[0],
            '',
            '✧ Estado:',
            '➤ Designado como Administrador.',
            '',
            '⚠️ Nota: El nuevo admin ahora tiene permisos de gestion.'
        ].join('\n')

        await conn.sendMessage(m.chat, {
            text: textMessage,
            mentions: [user],
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363407502496951@newsletter',
                    newsletterName: 'Eris-MD Oficial'
                },
                externalAdReply: {
                    title: 'ERIS-MD: SISTEMA ADMIN',
                    body: 'Accion: ' + command.toUpperCase(),
                    thumbnail: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error('Error en Promote:', e)
        m.reply('✦ *ERROR CRITICO*\n\n✧ Detalles:\n➤ No se pudo completar la promocion. Asegurate de que soy administrador.')
    }
}

handler.help = ['promote']
handler.tags = ['admin']
handler.command = ['promote', 'promover', 'darpija']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

