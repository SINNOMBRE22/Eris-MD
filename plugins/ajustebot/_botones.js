/* 🦈 ERIS-MD BUTTON HANDLER 🦈 */

const handler = m => m;

handler.all = async function (m) {
    // 1. Detectar si el mensaje contiene cualquier tipo de respuesta de botón o lista
    const btnMsg =
        m.message?.buttonsResponseMessage ||
        m.message?.templateButtonReplyMessage ||
        m.message?.listResponseMessage ||
        m.message?.interactiveResponseMessage; // Agregado para botones más nuevos

    if (!btnMsg) return true; 

    // Opcional: Si quieres que los botones funcionen también en privado, comenta la línea de abajo
    // if (!m.isGroup) return true;

    try {
        // 2. Extraer el ID o el texto del botón seleccionado
        const command = 
            btnMsg.selectedButtonId || 
            btnMsg.selectedId || 
            btnMsg.singleSelectReply?.selectedRowId ||
            (btnMsg.nativeFlowResponseMessage ? JSON.parse(btnMsg.nativeFlowResponseMessage.paramsJson).id : null);

        if (!command) return true;

        console.log(`🌸 [BUTTON SYSTEM] Procesando: ${command}`);

        // 3. Transformar el mensaje en un comando de texto plano
        // Esto "engaña" al resto de los plugins para que crean que el usuario escribió el comando
        m.message = {
            conversation: command
        };
        m.text = command; 

        // 4. Asegurar la identidad del remitente (Fix Crítico)
        const senderId = m.participant || m.key.participant || m.key.remoteJid;
        
        // Redefinimos el sender por si Baileys lo bloqueó como readonly
        Object.defineProperty(m, 'sender', {
            value: senderId,
            writable: true,
            configurable: true,
            enumerable: true
        });

    } catch (err) {
        console.error('❌ Error en el manejador de botones de Eris:', err);
    }

    return true; 
};

export default handler;
