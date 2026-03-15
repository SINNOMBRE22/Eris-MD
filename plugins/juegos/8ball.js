/* ERIS-MD BOLA 8 MAGICA */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const name = m.pushName || (await conn.getName(m.sender)) || "Usuario";

    if (!text) {
        return conn.reply(m.chat, `🌸 *El oráculo necesita una duda, ${name}.*\n\nHazme una pregunta de sí o no.\n> *Ejemplo:* ${usedPrefix + command} ¿Voy a ser millonario?`, m);
    }

    const pregunta = text.toLowerCase();
    let respuesta = '';

    // Lógica cómica predefinida de tu código
    if (pregunta.includes('gay') || pregunta.includes('homo') || pregunta.includes('bisexual')) {
        respuesta = 'Definitivamente sí. 💅';
    } else if (pregunta.includes('hetero') || pregunta.includes('heterosexual')) {
        respuesta = 'Por supuesto que no. 🤭';
    } else {
        // Banco de respuestas variadas al estilo Eris
        const respuestas = [
            'Sí, absolutamente.',
            'Lo dudo mucho.',
            'Es muy probable.',
            'No cuentes con ello, Proxy.',
            'Mi sistema dice que sí.',
            'Definitivamente no.',
            'Tal vez en otra vida.',
            'Concéntrate y vuelve a preguntar.',
            'Las probabilidades están a tu favor.',
            'Ni se te ocurra.'
        ];
        respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
    }

    let caption = `╭─── [ 🎱 *BOLA MÁGICA* ] ──···\n`;
    caption += `│ 👤 *Pregunta:* ${text}\n`;
    caption += `│ 🔮 *Eris dice:* ${respuesta}\n`;
    caption += `╰─────────────────────────···`;

    await m.react('🎱');
    await conn.reply(m.chat, caption, m);
}

handler.help = ['8ball <pregunta>'];
handler.tags = ['juegos'];
handler.command = ['8ball', 'bola8', 'pregunta'];
handler.register = false;

export default handler;
