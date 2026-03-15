/* ERIS-MD FORMAR PAREJAS (SHIPPEO) */

let handler = async (m, { conn, groupMetadata }) => {
    // Extraer todos los IDs de los participantes del grupo
    let ps = groupMetadata.participants.map(v => v.id);
    
    // Seguro por si el grupo está casi vacío
    if (ps.length < 2) {
        return conn.reply(m.chat, `🌸 *Se necesitan al menos 2 personas en el grupo para que el amor fluya.*`, m);
    }

    // Elegir dos personas al azar de forma 100% segura (sin .getRandom)
    let a = ps[Math.floor(Math.random() * ps.length)];
    let b;
    do {
        b = ps[Math.floor(Math.random() * ps.length)];
    } while (b === a); // Evitar que alguien se case consigo mismo

    let toM = id => '@' + id.split('@')[0];

    let caption = `╭─── [ 💍 *NUEVA PAREJA* ] ──···\n`;
    caption += `│ 💖 ${toM(a)}\n`;
    caption += `│ 💖 ${toM(b)}\n`;
    caption += `╰─────────────────────────···\n\n`;
    caption += `> 🌸 *Deberían casarse, hacen una bonita pareja.*`;

    await m.react('💍');
    
    // El mentions: [a, b] es vital para que las letras se pinten de azul
    await conn.reply(m.chat, caption, m, { mentions: [a, b] });
};

handler.help = ['formarpareja'];
handler.tags = ['juegos'];
handler.command = ['formarpareja', 'formarparejas', 'casar', 'shippear'];
handler.group = true; 
handler.register = false;

export default handler;
