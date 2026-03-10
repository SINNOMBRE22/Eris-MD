import pkg from 'ruhend-scraper'
const { igdl } = pkg // Extraemos la función de esta manera para evitar el SyntaxError

// --- Constantes y Configuración ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';

const handler = async (m, { text, conn, args }) => {
  const name = conn.getName(m.sender);
  
  // Variables locales como respaldo si las globales no existen
  const icons = global.icons || 'https://qu.ax/COmS.jpg';
  const redes = global.redes || 'https://github.com/SinNombre';

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
      title: 'Ellen Joe: Pista localizada. 🦈',
      body: `Procesando solicitud para el/la Proxy ${name}...`,
      thumbnailUrl: icons, 
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Necesito la URL de un video de Facebook para iniciar la extracción.`, m, { contextInfo, quoted: m });
  }

  if (!args[0].match(/facebook\.com|fb\.watch/g)) {
    return conn.reply(m.chat, `❌ *Enlace inválido, Proxy ${name}.* El enlace no parece ser de Facebook.`, m, { contextInfo, quoted: m });
  }

  try {
    await m.react('🔄');
    conn.reply(m.chat, `🔄 *Iniciando protocolo de extracción, Proxy ${name}.* Aguarda un momento...`, m, { contextInfo, quoted: m });
    
    // Usamos igdl como en tu script original
    const res = await igdl(args[0]);
    const result = res.data;

    if (!result || result.length === 0) {
      throw new Error('No se encontraron enlaces de descarga.');
    }

    // Buscamos la mejor calidad disponible
    const data = result.find(i => i.resolution === "720p (HD)") || 
                 result.find(i => i.resolution === "360p (SD)") || 
                 result.find(i => i.url && i.type === 'video') || 
                 result[0];

    if (!data || !data.url) {
      throw new Error('Video no disponible.');
    }

    const video = data.url;
    const caption = `╭━━━━[ 𝙵𝚊𝚌𝚎𝚋𝚘𝚘𝚔 𝙳𝚎𝚌𝚘𝚍𝚎𝚍 ]━━━━⬣
📹 *Contenido:* Video de Facebook
⚙️ *Resolución:* ${data.resolution || 'Óptima'}
🔗 *Proxy:* ${name}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`;

    await conn.sendMessage(m.chat, { 
      video: { url: video }, 
      caption: caption, 
      fileName: 'fb.mp4', 
      mimetype: 'video/mp4' 
    }, { quoted: m });
    
    await m.react('✅');

  } catch (e) {
    await m.react('❌');
    console.error("Error en Facebook Downloader:", e);
    return conn.reply(m.chat, `❌ *Fallo en la transmisión, Proxy ${name}.*\nDetalles: ${e.message || e}`, m, { contextInfo, quoted: m });
  }
}

handler.help = ['facebook <url>', 'fb <url>'];
handler.tags = ['descargas'];
handler.command = ['facebook', 'fb'];
handler.group = true;

export default handler;
