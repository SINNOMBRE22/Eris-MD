import { igdl } from 'ruhend-scraper' 

// --- Configuración Autónoma (Sin dependencias externas) ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '⏤͟͞ू⃪⁞⟡ 𝐄llen 𝐉ᴏ𝐄\'s 𝐒ervice';
const redes = 'https://facebook.com'; // Link por defecto

const handler = async (m, { text, conn, args }) => {
  const name = conn.getName(m.sender);

  // Definimos contextInfo aquí para que sea accesible en todo el scope
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
    externalAdReply: {
      title: 'Eris-MD: Descarga de Facebook 🦈',
      body: `USUARIO: ${name}`,
      thumbnailUrl: icons, 
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `🦈 *Rastro frío, Proxy ${name}.* Pega el link de Facebook para iniciar.`, m, { contextInfo });
  }

  try {
    await m.react('⌛');
    
    // Intentar obtener datos
    const res = await igdl(args[0]);
    const result = res?.data;

    if (!result || result.length === 0) {
      throw new Error("No se encontraron resultados en este enlace.");
    }

    // Buscar la mejor resolución disponible
    const data = result.find(i => i.resolution === "720p (HD)") || 
                 result.find(i => i.resolution === "360p (SD)") || 
                 result[0]; // El primero que aparezca si no hay etiquetas

    if (!data || !data.url) {
      throw new Error("El video no tiene una URL de descarga válida.");
    }

    const caption = `╭━━━━[ 𝙵𝙱 𝙳𝚎𝚌𝚘𝚍𝚎𝚍 ]━━━━⬣\n⚙️ *Resolución:* ${data.resolution || 'Estándar'}\n👤 *Proxy:* ${name}\n╰━━━━━━━━━━━━━━━━━━⬣`;

    // Enviar el video
    await conn.sendMessage(m.chat, { 
      video: { url: data.url }, 
      caption: caption, 
      fileName: 'fb.mp4', 
      mimetype: 'video/mp4' 
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error("Error en FB Downloader:", e);
    await m.react('❌');
    return conn.reply(m.chat, `❌ *Anomalía detectada:* ${e.message || e}`, m, { contextInfo });
  }
}

handler.help = ['fb <url>'];
handler.tags = ['descargas'];
handler.command = ['facebook', 'fb'];

export default handler;
