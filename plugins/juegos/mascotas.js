/* ERIS-MD PET SYSTEM (TAMAGOTCHI) */

let handler = async (m, { command, conn, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender];
    const name = m.pushName || (await conn.getName(m.sender)) || "Usuario";

    // Si el usuario no está registrado en la BD, lo inicializamos por seguridad
    if (!user) user = global.db.data.users[m.sender] = {};

    switch (command) {
        case 'crearpet':
        case 'adoptar':
            if (user.pet) return m.reply(`🌸 *Ya tienes una mascota, ${name}.*\n\nCuida a la que ya tienes usando \`${usedPrefix}perfilpet\`.`);
            
            let petName = args.join(' ') || 'Nagi';
            user.pet = {
                nombre: petName,
                hambre: 50,
                energia: 50,
                diversion: 50,
                nivel: 1,
                experiencia: 0,
            };
            
            let adoptCaption = `╭─── [ 🐾 *NUEVA MASCOTA* ] ──···\n`;
            adoptCaption += `│ 🌸 *Felicidades, ${name}*\n`;
            adoptCaption += `│ 🐶 *Nombre:* ${user.pet.nombre}\n`;
            adoptCaption += `│ 🌟 *Nivel:* 1\n`;
            adoptCaption += `╰─────────────────────────···\n\n`;
            adoptCaption += `> 💡 *Tip:* Usa ${usedPrefix}perfilpet para ver sus estadísticas.`;
            
            await m.react('💖');
            m.reply(adoptCaption);
            break;

        case 'perfilpet':
        case 'mipet':
            if (!user.pet) return m.reply(`🌸 *No tienes mascota.*\n\nUsa \`${usedPrefix}crearpet <nombre>\` para adoptar una.`);
            let p = user.pet;
            
            let perfilCaption = `╭─── [ 🐾 *PERFIL MASCOTA* ] ──···\n`;
            perfilCaption += `│ 🐶 *Nombre:* ${p.nombre}\n`;
            perfilCaption += `│ 🌟 *Nivel:* ${p.nivel} (${p.experiencia}/100 XP)\n`;
            perfilCaption += `│ \n`;
            perfilCaption += `│ 🍖 *Hambre:* ${barra(p.hambre)} ${p.hambre}%\n`;
            perfilCaption += `│ ⚡ *Energía:* ${barra(p.energia)} ${p.energia}%\n`;
            perfilCaption += `│ 🎈 *Diversión:* ${barra(p.diversion)} ${p.diversion}%\n`;
            perfilCaption += `╰─────────────────────────···`;
            
            m.reply(perfilCaption);
            break;

        case 'alimentarpet':
        case 'darcomida':
            if (!user.pet) return m.reply(`🌸 *No tienes mascota.*\n\nUsa \`${usedPrefix}crearpet <nombre>\` para adoptar una.`);
            if (user.pet.hambre >= 100) return m.reply(`🌸 *${user.pet.nombre} ya está lleno.* No lo obligues a comer más.`);
            
            user.pet.hambre = Math.min(100, user.pet.hambre + 30);
            user.pet.energia = Math.min(100, user.pet.energia + 10); // Comer da poquita energía
            user.pet.experiencia += 15;
            
            await m.react('🍖');
            let msgAlimento = `🌸 *Le diste de comer a ${user.pet.nombre}.*\n🍖 Hambre: ${user.pet.hambre}/100 (+30)\n✨ XP: +15`;
            
            if (verificarNivel(user)) msgAlimento += `\n\n🎉 ¡${user.pet.nombre} ha subido al Nivel ${user.pet.nivel}!`;
            m.reply(msgAlimento);
            break;

        case 'jugarpet':
        case 'jugar':
            if (!user.pet) return m.reply(`🌸 *No tienes mascota.*\n\nUsa \`${usedPrefix}crearpet <nombre>\` para adoptar una.`);
            if (user.pet.energia <= 20) return m.reply(`🌸 *${user.pet.nombre} está muy cansado para jugar.*\nPonlo a dormir con \`${usedPrefix}dormirpet\`.`);
            if (user.pet.diversion >= 100) return m.reply(`🌸 *${user.pet.nombre} ya se divirtió suficiente por hoy.*`);
            
            user.pet.diversion = Math.min(100, user.pet.diversion + 35);
            user.pet.energia = Math.max(0, user.pet.energia - 20); // Jugar gasta energía
            user.pet.hambre = Math.max(0, user.pet.hambre - 15);   // Jugar da hambre
            user.pet.experiencia += 20;
            
            await m.react('🎾');
            let msgJuego = `🌸 *Jugaste con ${user.pet.nombre}.*\n🎈 Diversión: ${user.pet.diversion}/100 (+35)\n⚡ Energía: ${user.pet.energia}/100 (-20)\n✨ XP: +20`;
            
            if (verificarNivel(user)) msgJuego += `\n\n🎉 ¡${user.pet.nombre} ha subido al Nivel ${user.pet.nivel}!`;
            m.reply(msgJuego);
            break;

        case 'dormirpet':
        case 'dormir':
            if (!user.pet) return m.reply(`🌸 *No tienes mascota.*\n\nUsa \`${usedPrefix}crearpet <nombre>\` para adoptar una.`);
            if (user.pet.energia >= 100) return m.reply(`🌸 *${user.pet.nombre} no tiene sueño.* Juega con él primero.`);
            
            user.pet.energia = 100; // Dormir restaura todo
            user.pet.hambre = Math.max(0, user.pet.hambre - 25); // Dormir da hambre
            user.pet.experiencia += 10;
            
            await m.react('💤');
            let msgDormir = `🌸 *${user.pet.nombre} durmió profundamente.*\n⚡ Energía: 100/100 (Restaurada)\n🍖 Hambre: ${user.pet.hambre}/100 (-25)\n✨ XP: +10`;
            
            if (verificarNivel(user)) msgDormir += `\n\n🎉 ¡${user.pet.nombre} ha subido al Nivel ${user.pet.nivel}!`;
            m.reply(msgDormir);
            break;
    }
};

handler.help = ['crearpet', 'perfilpet', 'alimentarpet', 'jugarpet', 'dormirpet'];
handler.tags = ['juegos'];
handler.command = /^(crearpet|adoptar|perfilpet|mipet|alimentarpet|darcomida|jugarpet|jugar|dormirpet|dormir)$/i;
handler.register = false;

export default handler;

// --- FUNCIONES INTERNAS ---

// Verifica si subió de nivel y retorna true/false para avisar
function verificarNivel(user) {
    let pet = user.pet;
    if (pet.experiencia >= 100) {
        pet.experiencia -= 100; // Sobrante para el siguiente nivel
        pet.nivel += 1;
        return true;
    }
    return false;
}

// Genera una barra visual (🟩🟩🟩⬜⬜)
function barra(valor) {
    let llenos = Math.round(valor / 20);
    let vacios = 5 - llenos;
    return '🟩'.repeat(llenos) + '⬜'.repeat(vacios);
}
