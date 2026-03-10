/* 🦈 ACTIVADOR DE FUNCIONES - ERIS-MD SYSTEM 🦈 */

const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let chat = global.db.data.chats[m.chat];
  let bot = global.db.data.settings[conn.user.jid] || {};
  
  // El "type" ahora es el primer argumento (ej: antilink)
  let type = (args[0] || '').toLowerCase();
  let isEnable = command === 'activar'; // Si el comando es "activar", es true.
  
  if (!type) {
    return conn.reply(m.chat, `「✦」Uso Correcto:\n> ✐ *${usedPrefix}${command} antilink*\n\nEscribe *${usedPrefix}config* Para Ver La Lista De Funciones.`, m);
  }

  switch (type) {
    case 'welcome':
    case 'bienvenida':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false; }
      chat.welcome = isEnable;
      break;

    case 'antilink':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false; }
      chat.antiLink = isEnable;
      break;

    case 'nsfw':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false; }
      chat.nsfw = isEnable;
      break;

    case 'detect':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false; }
      chat.detect = isEnable;
      break;
      
    case 'autolevelup':
      chat.autolevelup = isEnable;
      break;

    // Puedes seguir agregando aquí todos los cases (antitoxic, antitraba, etc.)
    
    default:
      return conn.reply(m.chat, `「✦」La Función *${type}* No Existe En La Lista De Eris-MD.`, m);
  }

  const mensajeFinal = `《✦》La Función *${type.toUpperCase()}* Se *${isEnable ? 'Activó' : 'Desactivó'}* Correctamente.`;
  conn.reply(m.chat, mensajeFinal, m);
};

handler.help = ['activar', 'desactivar'].map(v => v + ' <función>');
handler.tags = ['grupo'];
handler.command = ['activar', 'desactivar', 'on', 'off']; // Comandos principales
handler.group = true;
handler.admin = true;

export default handler;
