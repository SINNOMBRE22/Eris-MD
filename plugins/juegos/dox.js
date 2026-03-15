/* ERIS-MD FAKE OSINT / DOX */

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // 1. Identificar a la víctima
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
        targetName = text; // Si solo pone un nombre al azar
    } else {
        return conn.reply(m.chat, `🌸 *¿A quién vamos a investigar?*\n\nEtiqueta a alguien, responde a su mensaje o escribe su nombre.\n> *Ejemplo:* ${usedPrefix + command} @SinNombre`, m);
    }

    // 2. Generar datos técnicos falsos y aleatorios
    const r1 = () => Math.floor(Math.random() * 256);
    const fakeIp = `${r1()}.${r1()}.${r1()}.${r1()}`;
    const fakeMac = 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]);
    const fakePorts = [80, 443, 8080, 22, 21][Math.floor(Math.random() * 5)];
    const lat = (Math.random() * 90).toFixed(4) * (Math.random() > 0.5 ? 1 : -1);
    const lon = (Math.random() * 180).toFixed(4) * (Math.random() > 0.5 ? 1 : -1);

    // 3. Mensaje inicial
    const { key } = await conn.sendMessage(m.chat, { text: `🧑‍💻 *Eris Service iniciando rastreo...*`, mentions: mentionsArray }, { quoted: m });

    // 4. Animación de Hacking
    const frames = [
        "《 █▒▒▒▒▒▒▒▒▒▒▒》10% - Extrayendo paquetes...",
        "《 ████▒▒▒▒▒▒▒▒》30% - Vulnerando firewall...",
        "《 ███████▒▒▒▒▒》50% - Interceptando tráfico...",
        "《 ██████████▒▒》80% - Desencriptando claves...",
        "《 ████████████》100% - Datos obtenidos."
    ];

    for (let i = 0; i < frames.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay para que se vea real
        await conn.sendMessage(m.chat, { text: `🧑‍💻 *Rastreando a ${targetName}...*\n${frames[i]}`, edit: key, mentions: mentionsArray });
    }

    // 5. Resultado Final
    let caption = `╭─── [ 🧑‍💻 *DOX RESULT* ] ──···\n`;
    caption += `│ 👤 *Target:* ${targetName}\n`;
    caption += `│ 🌐 *IP (IPv4):* ${fakeIp}\n`;
    caption += `│ 🔗 *MAC:* ${fakeMac}\n`;
    caption += `│ 📡 *ISP:* Ucom Universal\n`;
    caption += `│ 🛡️ *Router:* ERICCSON\n`;
    caption += `│ 🔓 *Puertos Abiertos:* ${fakePorts}, 8443\n`;
    caption += `│ 🧭 *Coordenadas:* ${lat}, ${lon}\n`;
    caption += `╰─────────────────────────···\n\n`;
   const senderName = m.pushName || "Usuario";
caption += `> 🌸 *Información extraída con éxito, ${senderName}.*`;


    // Reacción final
    await m.react('💀');
    await conn.sendMessage(m.chat, { text: caption, edit: key, mentions: mentionsArray });
}

handler.help = ['doxear <@tag>'];
handler.tags = ['juegos'];
handler.command = ['doxear', 'doxxeo', 'doxeo', 'dox'];
handler.group = true;
handler.register = false;

export default handler;
