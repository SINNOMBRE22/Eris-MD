// Archivo: ./lib/apiChecker.js
// Versión adaptada para la red 'eris' y la marca Eris

import chalk from 'chalk';

// ====================================================================
// CONSTANTES GLOBALES DE API
// ====================================================================
// El bot asume que está sirviendo a la red 'eris'

// Endpoints para Códigos de Verificación (ahora apuntan a 'eris')
const CODES_API_ENDPOINT = 'https://report-bots-causas.duckdns.org/api/verification/codes/pending/eris';
const CODES_NOTIFICATION_BASE_URL = 'https://report-bots-causas.duckdns.org/api/verification/codes/mandado/eris';

// Endpoints para Mensajes del Bot (Actualizaciones de Reportes) (ahora apuntan a 'eris')
const MESSAGES_API_ENDPOINT = 'https://report-bots-causas.duckdns.org/api/verification/messages/pending/eris';
const MESSAGES_NOTIFICATION_BASE_URL = 'https://report-bots-causas.duckdns.org/api/verification/messages/mandado/eris';

const TARGET_NETWORK = 'ERIS';

// ====================================================================
// CHEQUEO UNIFICADO Y SECUENCIAL DE ENDPOINTS (EXPORT ÚNICO)
// ====================================================================

/**
 * Realiza una revisión SILENCIOSA, priorizando códigos de verificación.
 * Si se encuentran y procesan códigos, NO revisa los mensajes de actualización (Lógica de Prioridad).
 * @param {object} conn - La instancia de conexión de Baileys.
 * @param {object} dbData - La data de la base de datos (global.db.data).
 */
export async function checkCodesEndpoint(conn, dbData) {
  const botUsers = dbData.users || {};
  let codesWereProcessed = false; // Bandera para la lógica de prioridad.

  // ====================================================================
  // 1. CHEQUEO DE CÓDIGOS DE VERIFICACIÓN (PRIORIDAD)
  // ====================================================================
  try {
    const response = await fetch(CODES_API_ENDPOINT);

    if (response.ok) {
      const pendingCodes = await response.json();

      if (pendingCodes && pendingCodes.length > 0) {
        codesWereProcessed = true;

        const sendPromises = pendingCodes.map(async (codeEntry) => {
          const rawNumber = codeEntry.phone_number;
          const code = codeEntry.code;
          const id = codeEntry.id;

          if (!rawNumber || !code) {
            return { id, sent: false, reason: 'Missing Data' };
          }

          let cleanedNumber = rawNumber.replace(/[^0-9]/g, '');
          let userJID = `${cleanedNumber}@s.whatsapp.net`;
          let isUserInDB = !!(botUsers[userJID] && Object.keys(botUsers[userJID]).length > 0);

          if (!isUserInDB) {
            return { id, sent: false, reason: 'Not in bot DB' };
          }

          try {
            const messageText = `🔑 Tu código de verificación para la red ${TARGET_NETWORK} es: *${code}*.`;
            await conn.sendMessage(userJID, { text: messageText });
            return { id, sent: true };
          } catch (sendError) {
            return { id, sent: false, reason: sendError?.message || String(sendError) };
          }
        });

        const results = await Promise.all(sendPromises);

        const sentCodeIds = results.filter(r => r.sent).map(r => r.id);

        if (sentCodeIds.length > 0) {
          const idsString = sentCodeIds.join(',');
          const NOTIFICATION_ENDPOINT = `${CODES_NOTIFICATION_BASE_URL}?id=${idsString}`;

          try {
            const notificationResponse = await fetch(NOTIFICATION_ENDPOINT);
            if (!notificationResponse.ok) {
              // Forzamos el error para evitar reenvío sin confirmación
              throw new Error(`API central respondió con error HTTP: ${notificationResponse.status}`);
            }
          } catch (notificationError) {
            // Silencioso: se reintentará en el siguiente ciclo
            if (global?.opts?.verbose) console.log(chalk.yellow('[apiChecker] Error notificando códigos:'), notificationError.message || notificationError);
          }
        }
      }
    }
  } catch (error) {
    // Silencioso: errores de fetch inicial o Promise.all
    if (global?.opts?.verbose) console.log(chalk.red('[apiChecker] Error al revisar códigos:'), error?.message || error);
  }

  // Si se procesaron códigos, no continuamos con mensajes
  if (codesWereProcessed) return;

  // ====================================================================
  // 2. CHEQUEO DE MENSAJES PENDIENTES DEL BOT (SOLO SI NO HUBO CÓDIGOS)
  // ====================================================================
  try {
    const response = await fetch(MESSAGES_API_ENDPOINT);

    if (response.ok) {
      const pendingMessages = await response.json();

      if (pendingMessages && pendingMessages.length > 0) {
        const sendPromises = pendingMessages.map(async (msgEntry) => {
          const rawNumber = msgEntry.phone_number;
          const messageText = msgEntry.message;
          const id = msgEntry.id;

          if (!rawNumber || !messageText) {
            return { id, sent: false, reason: 'Missing Data' };
          }

          let cleanedNumber = rawNumber.replace(/[^0-9]/g, '');
          let userJID = `${cleanedNumber}@s.whatsapp.net`;
          let isUserInDB = !!(botUsers[userJID] && Object.keys(botUsers[userJID]).length > 0);

          if (!isUserInDB) {
            return { id, sent: false, reason: 'Not in bot DB' };
          }

          try {
            await conn.sendMessage(userJID, { text: messageText });
            return { id, sent: true };
          } catch (sendError) {
            return { id, sent: false, reason: sendError?.message || String(sendError) };
          }
        });

        const results = await Promise.all(sendPromises);

        const sentMessageIds = results.filter(r => r.sent).map(r => r.id);

        if (sentMessageIds.length > 0) {
          const idsString = sentMessageIds.join(',');
          const NOTIFICATION_ENDPOINT = `${MESSAGES_NOTIFICATION_BASE_URL}?id=${idsString}`;

          try {
            const notificationResponse = await fetch(NOTIFICATION_ENDPOINT);
            if (!notificationResponse.ok) {
              throw new Error(`API central respondió con error HTTP: ${notificationResponse.status}`);
            }
          } catch (notificationError) {
            if (global?.opts?.verbose) console.log(chalk.yellow('[apiChecker] Error notificando mensajes:'), notificationError.message || notificationError);
          }
        }
      }
    }
  } catch (error) {
    if (global?.opts?.verbose) console.log(chalk.red('[apiChecker] Error al revisar mensajes:'), error?.message || error);
  }
}
