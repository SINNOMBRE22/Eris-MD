import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Helper: convierte Buffer de Node a ArrayBuffer compatible con Blob
 */
function bufferToArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

/**
 * Upload file to qu.ax
 * Supported mimetypes:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * - `video/mp4`
 * - `video/webm`
 * - `audio/mpeg`
 * - `audio/wav`
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>}
 */
export default async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {};
  const form = new FormData();
  const arrayBuffer = bufferToArrayBuffer(buffer);
  const blob = new Blob([arrayBuffer], { type: mime });
  form.append('files[]', blob, 'tmp.' + (ext || 'bin'));
  const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form });
  const result = await res.json();
  if (result && result.success) {
    return result.files[0].url;
  } else {
    throw new Error('Failed to upload the file to qu.ax');
  }
};
