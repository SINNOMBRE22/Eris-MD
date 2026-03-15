/* ERIS-MD REACCIONES VISUALES */

let handler = async (m, { conn, command, usedPrefix }) => {
    // Identificar al objetivo (si etiqueta o responde a alguien)
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
    
    // Nombres formateados para las etiquetas
    let senderName = `@${m.sender.split('@')[0]}`;
    let targetName = who ? `@${who.split('@')[0]}` : null;

    let url = '';
    let caption = '';
    let mentionsArray = [m.sender]; // Siempre incluimos al que envía el comando
    if (who) mentionsArray.push(who); // Si hay víctima, la sumamos al array azul

    switch (command) {
        case 'chupa':
        case 'chupalo':
            if (!who) return conn.reply(m.chat, `🌸 *¿A quién se lo decimos?*\n\nEtiqueta a alguien.\n> *Ejemplo:* ${usedPrefix + command} @SinNombre`, m);
            url = 'https://telegra.ph/file/dc717696efd6182a47f07.jpg';
            caption = `╭─── [ 🤣 *CHÚPALO* ] ──···\n│ 👤 ${targetName}\n╰─────────────────────────···`;
            break;

        case 'aplauso':
            if (!who) return conn.reply(m.chat, `🌸 *¿A quién le aplaudimos?*\n\nEtiqueta a alguien.\n> *Ejemplo:* ${usedPrefix + command} @SinNombre`, m);
            url = 'https://telegra.ph/file/0e40f5c0cf98dffc55045.jpg';
            caption = `╭─── [ 🎉 *FELICIDADES* ] ──···\n│ 👤 ${targetName}, eres un pendejo.\n╰─────────────────────────···`;
            break;

        case 'marron':
        case 'negro':
            if (!who) return conn.reply(m.chat, `🌸 *¿A quién acusamos?*\n\nEtiqueta a alguien.\n> *Ejemplo:* ${usedPrefix + command} @SinNombre`, m);
            url = 'https://telegra.ph/file/5592d6bd38d411554018c.png';
            caption = `╭─── [ 💀 *ALERTA* ] ──···\n│ 👤 ${targetName} es un marrón de mrd.\n╰─────────────────────────···`;
            break;

        case 'suicide':
        case 'suicidar':
            url = 'https://files.catbox.moe/w3v3e0.jpg';
            caption = `╭─── [ ⚰️ *R.I.P* ] ──···\n│ 👤 ${senderName} ha decidido abandonar la partida.\n╰─────────────────────────···\n\n> 🌸 *Descanse en paz.*`;
            break;
    }

    // Enviar la imagen con su texto y etiquetas correctas
    await conn.sendMessage(m.chat, { 
        image: { url: url }, 
        caption: caption, 
        mentions: mentionsArray 
    }, { quoted: m });
};

handler.help = ['chupalo', 'aplauso', 'marron', 'suicidar'];
handler.tags = ['juegos'];
handler.command = ['chupalo', 'chupa', 'aplauso', 'negro', 'marron', 'suicidar', 'suicide'];
handler.group = true;
handler.register = false;

export default handler;
