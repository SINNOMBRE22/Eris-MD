/* ERIS-MD CALCULADORA RANDOM (TESTS) */

let handler = async (m, { conn, command, text, usedPrefix }) => {
    const name = m.pushName || (await conn.getName(m.sender)) || "Usuario";

    if (!text && !m.quoted && !(m.mentionedJid && m.mentionedJid[0])) {
        return conn.reply(m.chat, `🌸 *Necesito una víctima, ${name}.*\n\nMenciona a alguien, responde a su mensaje o escribe su nombre para hacerle el test.\n> *Ejemplo:* ${usedPrefix + command} @SinNombre`, m);
    }

    // --- LÓGICA DE MENCIÓN CORREGIDA ---
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
    } else {
        targetName = text.toUpperCase();
    }

    // Generar porcentaje aleatorio entre 0 y 500
    const percentage = Math.floor(Math.random() * 501); 
    let emoji = '';
    let description = '';

    switch (command) {
        case 'gay':
            emoji = '🏳️‍🌈';
            if (percentage < 50) description = `💙 Los cálculos indican que ${targetName} es *${percentage}%* Gay ${emoji}\n> ✰ Eso es bajo, ¡tú eres joto, no gay!`;
            else if (percentage > 100) description = `💜 Los cálculos indican que ${targetName} es *${percentage}%* Gay ${emoji}\n> ✰ ¡Incluso más gay de lo que pensábamos!`;
            else description = `🖤 Los cálculos indican que ${targetName} es *${percentage}%* Gay ${emoji}\n> ✰ Lo tuyo, lo tuyo es que eres gay.`;
            break;
        case 'lesbiana':
            emoji = '🏳️‍🌈';
            if (percentage < 50) description = `👻 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ Quizás necesites más películas románticas.`;
            else if (percentage > 100) description = `❣️ Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Eso es un amor extremo por las chicas!`;
            else description = `💗 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Mantén el amor floreciendo!`;
            break;
        case 'pajero':
        case 'pajera':
            emoji = '😏💦';
            if (percentage < 50) description = `🧡 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Tal vez necesites más hobbies!`;
            else if (percentage > 100) description = `💕 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Eso es una resistencia admirable!`;
            else description = `💞 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ Mantén el buen trabajo (en solitario).`;
            break;
        case 'puto':
        case 'puta':
            emoji = '🔥🥵';
            if (percentage < 50) description = `😼 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Más suerte en tu próxima conquista!`;
            else if (percentage > 100) description = `😻 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Estás en llamas!`;
            else description = `😺 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Mantén ese encanto ardiente!`;
            break;
        case 'manco':
        case 'manca':
            emoji = '💩';
            if (percentage < 50) description = `🌟 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ Juegas bien, al menos le das a los bots.`;
            else if (percentage > 100) description = `💌 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Tienes un talento especial para fallar balas!`;
            else description = `🥷 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ Sigue practicando, algún día darás un tiro a la cabeza.`;
            break;
        case 'rata':
            emoji = '🐁';
            if (percentage < 50) description = `💥 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Nada de malo en disfrutar del queso!`;
            else if (percentage > 100) description = `💖 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Un auténtico ratón de lujo! Loteas antes de revivir.`;
            else description = `👑 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Come queso con responsabilidad!`;
            break;
        case 'prostituto':
        case 'prostituta':
            emoji = '🫦👅';
            if (percentage < 50) description = `❀ Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡El mercado está en auge!`;
            else if (percentage > 100) description = `💖 Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Un/a verdadero/a profesional!`;
            else description = `✨ Los cálculos indican que ${targetName} es *${percentage}%* ${command} ${emoji}\n> ✰ ¡Siempre es hora de hacer negocios!`;
            break;
    }

    // 1. Enviar mensaje inicial
    const { key } = await conn.sendMessage(m.chat, { text: `⏳ *Eris está calculando el nivel de ${command}...*`, mentions: mentionsArray }, { quoted: m });

    // 2. Animación de carga fluida
    const frames = [
        "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
        "《 ████▒▒▒▒▒▒▒▒》30%",
        "《 ███████▒▒▒▒▒》50%",
        "《 ██████████▒▒》80%",
        "《 ████████████》100%"
    ];

    for (let i = 0; i < frames.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Espera 0.8s por frame
        await conn.sendMessage(m.chat, { text: `⏳ *Analizando datos...*\n${frames[i]}` , edit: key, mentions: mentionsArray });
    }

    // 3. Resultado Final con la UI de Eris
    let caption = `╭─── [ 💫 *TEST RESULT* ] ──···\n`;
    const descLines = description.split('\n');
    caption += `│ ${descLines[0]}\n`;
    caption += `│ ${descLines[1]}\n`;
    caption += `╰─────────────────────────···\n\n`;
    caption += `> 🌸 *El universo y Eris han hablado.*`;

    await conn.sendMessage(m.chat, { text: caption, edit: key, mentions: mentionsArray });
};

handler.help = ['gay', 'lesbiana', 'pajero', 'puto', 'manco', 'rata', 'prostituto'].map(v => v + ' <@tag>');
handler.tags = ['juegos'];
handler.command = ['gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'];
handler.group = true;
handler.register = false;

export default handler;
