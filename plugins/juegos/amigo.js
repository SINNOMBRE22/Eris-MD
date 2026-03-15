/* ERIS-MD AMISTAD RANDOM */

let handler = async (m, { conn, groupMetadata }) => {
    // Extraer todos los IDs de los participantes del grupo
    let ps = groupMetadata.participants.map(v => v.id);
    
    // Seguro por si el grupo está muerto o solo estás tú y el bot
    if (ps.length < 2) {
        return conn.reply(m.chat, `🌸 *Se necesitan al menos 2 personas en el grupo para formar parejas.*`, m);
    }

    // Elegir dos personas al azar sin depender de prototipos externos
    let a = ps[Math.floor(Math.random() * ps.length)];
    let b;
    do {
        b = ps[Math.floor(Math.random() * ps.length)];
    } while (b === a); // Evita que la misma persona salga dos veces

    let toM = a => '@' + a.split('@')[0];

    let caption = `╭─── [ 🌸 *NUEVA AMISTAD* ] ──···\n`;
    caption += `│ 👤 ${toM(a)}\n`;
    caption += `│ 👤 ${toM(b)}\n`;
    caption += `╰─────────────────────────···\n\n`;
    caption += `> 🌸 *Eris los ha elegido. Vayan al privado y armen unas partidas de PUBG Mobile o Free Fire para romper el hielo. 😉*`;

    await m.react('🤝');
    // Se usa 'mentions' para que WhatsApp sí los etiquete de color azul
    await conn.reply(m.chat, caption, m, { mentions: [a, b] });
};

handler.help = ['amistad'];
handler.tags = ['juegos'];
handler.command = ['amigorandom', 'amistad', 'pareja'];
handler.group = true; // Solo funciona en grupos
handler.register = false;

export default handler;
