/* ERIS-MD CHISTES RANDOM */

let handler = async (m, { conn, command }) => {
    // Array local: Solo consume memoria en el instante que se usa el comando
    const chistes = [
        "¿Cuál es el último animal que subió al arca de Noé? El del-fin. 🐬",
        "¿Cómo se dice pañuelo en japonés? Saka-moko. 🤧",
        "¿Cómo se dice disparo en árabe? Ahí-va-la-bala. 💥",
        "¿Qué le dice un gusano a otro gusano? Voy a dar una vuelta a la manzana. 🍎",
        "Un gato empieza a ladrar en el tejado de una casa. Otro gato, sorprendido, le dice: Estás loco gato, ¿por qué ladras en vez de maullar? El gatito le responde: ¿Acaso no puedo aprender otro idioma? 🐈",
        "El doctor le dice al paciente: respire profundo que lo voy a auscultar. El paciente le responde: doctor, ¿de quién me va a ocultar si no le debo a nadie? 👨‍⚕️",
        "Sale el doctor después de un parto y el padre pregunta: ¿Doctor cómo salió todo? El doctor le dice: todo salió bien, pero tuvimos que colocarle oxígeno al bebé. El padre, horrorizado, le dice: pero doctor, nosotros queríamos ponerle Gabriel. 👶",
        "Un pez le pregunta a otro pez: ¿qué hace tu mamá? Este le contesta: Nada, ¿y la tuya qué hace? Nada también. 🐟",
        "¿Cuál es el colmo de Aladdín? Tener mal genio. 🧞‍♂️",
        "El profesor le dice al estudiante: Tu trabajo me ha conmovido. El estudiante, sorprendido, pregunta: ¿Y eso por qué profesor? El profesor le dice: Porque me dio mucha pena. 📚",
        "Le dice el niño a la madre: Mamá, no quiero jugar más con Pedrito. La madre pregunta: ¿Por qué? Porque cuando jugamos a los tacos de madera y le pego con uno en la cabeza, se pone a llorar. 🪵",
        "Hijo, me veo gorda, fea y vieja. ¿Qué tengo hijo, qué tengo? Mamá, tienes toda la razón. 💀",
        "¿Cómo se dice pelo sucio en chino? Chin cham pu. 🧴",
        "Una amiga le dice a otra: ¿Qué tal va la vida de casada? Pues no me puedo quejar, dice ella. ¿O sea que va muy bien, no? No, no me puedo quejar porque mi marido está aquí al lado. 🤫",
        "¿Por qué las focas miran siempre hacia arriba? ¡Porque ahí están los focos! 🦭",
        "Camarero, ese filete tiene muchos nervios. Pues normal, es la primera vez que se lo comen. 🥩",
        "¿Cómo se llama el primo de Bruce Lee? Broco Lee. 🥦",
        "Una madre le dice a su hijo: Jaimito, me ha dicho un pajarito que te drogas. La que te drogas eres tú, que hablas con pajaritos. 🐦"
    ];

    // Selección aleatoria limpia
    const chiste = chistes[Math.floor(Math.random() * chistes.length)];

    let caption = `╭─── [ 🎭 *CHISTE RANDOM* ] ──···\n`;
    // Reemplazamos los saltos de línea del chiste por el borde lateral de la caja
    const lineas = chiste.split('\n');
    for (let linea of lineas) {
        caption += `│ ${linea}\n`;
    }
    caption += `╰─────────────────────────···\n\n`;
    caption += `> 🌸 *Eris Service intentando dar risa.*`;

    await m.react('🤣');
    await conn.reply(m.chat, caption, m);
}

handler.help = ['chiste'];
handler.tags = ['juegos'];
handler.command = ['chiste', 'broma'];
handler.group = true;
handler.register = false;

export default handler;
