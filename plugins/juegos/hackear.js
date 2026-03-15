/* ERIS-MD HACKING SIMULATOR */

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Tomamos tu nombre directamente
    const senderName = m.pushName || (await conn.getName(m.sender)) || "Usuario";

    // Identificar a la víctima
    let who;
    let targetName;
    let mentionsArray = [];

    if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0];
        targetName = '@' + who.split('@')[0];
        mentionsArray.push(who);
    } else if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender;
        targetName = '@' + who.split('@')[0];
        mentionsArray.push(who);
    } else if (text) {
        targetName = text;
    } else {
        return conn.reply(m.chat, `🌸 *¿Qué sistema vamos a vulnerar?*\n\nEtiqueta a alguien o escribe su nombre.\n> *Ejemplo:* ${usedPrefix + command} @SinNombre`, m);
    }

    // Mensaje inicial
    const { key } = await conn.sendMessage(m.chat, { text: `💀 *Inicializando secuencias de inyección...*`, mentions: mentionsArray }, { quoted: m });

    // Frames de la animación de terminal (Corregidos y acelerados)
    const frames = [
        "🖥️ *Terminal Eris OS*:\n> Injecting Malware...",
        "🖥️ *Terminal Eris OS*:\n> █ 10%",
        "🖥️ *Terminal Eris OS*:\n> ████ 40%",
        "🖥️ *Terminal Eris OS*:\n> ███████ 70%",
        "🖥️ *Terminal Eris OS*:\n> ██████████ 100%\n> Malware Injected.",
        "🖥️ *Terminal Eris OS*:\n> System hijacking in process...\n> Bypassing firewall...",
        "🖥️ *Terminal Eris OS*:\n> Device successfully connected.\n> Receiving data...",
        "🖥️ *Terminal Eris OS*:\n> Data hijacked from device 100%.\n> Killing all evidence...",
        "🖥️ *Terminal Eris OS*:\n> HACKING COMPLETED.\n> Disconnecting..."
    ];

    // Ejecutar animación fluida
    for (let i = 0; i < frames.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 750)); // 0.75s por frame para que sea rápido y letal
        await conn.sendMessage(m.chat, { text: frames[i], edit: key, mentions: mentionsArray });
    }

    // Resultado Final con el estilo de Eris
    let caption = `╭─── [ 💀 *SYSTEM HACKED* ] ──···\n`;
    caption += `│ 🎯 *Target:* ${targetName}\n`;
    caption += `│ 📂 *Status:* Datos extraídos\n`;
    caption += `│ 🧹 *Logs:* Eliminados\n`;
    caption += `╰─────────────────────────···\n\n`;
    caption += `> 🌸 *Operación encubierta finalizada, ${senderName}.*`;

    await m.react('☠️');
    await conn.sendMessage(m.chat, { text: caption, edit: key, mentions: mentionsArray });
};

handler.help = ['hackear <@tag>'];
handler.tags = ['juegos'];
handler.command = ['doxxing', 'hackear', 'hack'];
handler.group = true;
handler.register = false;

export default handler;
