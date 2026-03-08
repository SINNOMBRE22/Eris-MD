// --- VALORES NECESARIOS ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = 'Eris Service';
const packname = 'Eris-Pack';
const redes = 'https://github.com/SINNOMBRE22/Eris-MD';

/**
 * Plugin centralizado para manejar mensajes de error de permisos.
 */
const handler = async (type, conn, m, comando) => {
    const icons = global.icons ? global.icons : null;

    const templates = {
        rowner: `『🦈』No puedes usar *${comando}*. Solo mi creador tiene acceso a eso.`,
        owner: `『⚙️』Comando exclusivo para Owners: *${comando}*. No tienes permisos.`,
        mods: `『🔌』Comando reservado para Moderadores: *${comando}*.`,
        premium: `『🌟』*${comando}* requiere cuenta Premium.`,
        group: `『🫂』*${comando}* solo funciona en grupos.`,
        private: `『🏠』*${comando}* solo funciona en chats privados.`,
        admin: `『👑』*${comando}* requiere que seas admin del grupo.`,
        botAdmin: `『🚫』Necesito ser admin para ejecutar *${comando}*. Por favor, otórgame permisos.`,
        unreg: `『📝』Estás sin registrar. Regístrate con: *#reg Nombre.Edad*`,
        restrict: `『⛔』Función restringida: no tienes acceso a *${comando}*.`
    };

    const msg = templates[type];

    if (msg) {
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
                title: packname,
                body: 'SERVICIO DENEGADO',
                thumbnail: icons,
                sourceUrl: redes,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        };

        return conn.reply(m.chat, msg, m, { contextInfo }).then(() => {
            try { m.react && m.react('✖️') } catch {}
        });
    }
    return true;
};

export default handler;
