/* 🦈 ERIS-MD AI (GROQ ENGINE - ULTRA FAST) 🦈 */

import fetch from 'node-fetch'

// 🔑 Tu clave de Groq (La misma del auto-respondedor)
const GROQ_API_KEY = "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"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🌸 ¿De qué quieres hablar?\n\n*Ejemplo:* ${usedPrefix}${command} Cuéntame un chiste de programadores.`);

    try {
        await conn.reply(m.chat, '🌸 Conectando a mi red neuronal privada...', m);

        // Personalidad de Eris inyectada en la IA
        const systemPrompt = `Eres Eris, Tu creador tiene alias del SinNombre. eres una ia demo aun wn desarrollo, solo revela datos como estos sibse te piden`;

        // Llamada directa a Groq (Es súper rápido y estable)
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant", // El motor que ya sabemos que te funciona
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                temperature: 0.8, 
                max_tokens: 800
            })
        });

        if (!res.ok) throw new Error("Error en el servidor de Groq");

        const data = await res.json();
        const responseText = data?.choices?.[0]?.message?.content || "";

        if (!responseText) throw new Error("Respuesta vacía de la IA");

        // Enviar la respuesta final
        await conn.sendMessage(m.chat, { 
            text: `🌸 *Eris:*\n\n${responseText.trim()}`
        }, { quoted: m });

    } catch (err) {
        console.error("❌ Error Crítico en IA:", err.message);
        m.reply('🌸 Tsk. Mi conexión privada falló. Dáme un respiro e intenta de nuevo.');
    }
}

handler.help = ['erisia (texto)']
handler.command = ['erisia'] // ¡Un solo comando, exclusivo para ella!
handler.tags = ['ia']


export default handler;
