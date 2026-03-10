let stdouts = []

/**
 * Hook para capturar los writes a stdout en memoria (útil para debug).
 * Retorna un objeto con métodos: disable(), isModified, logs().
 * @param {number} maxLength
 * @returns {{ disable: function(): void, isModified: boolean, logs: function(): Buffer }}
 */
export default (maxLength = 200) => {
  const oldWrite = process.stdout.write.bind(process.stdout)

  const disable = () => {
    state.isModified = false
    process.stdout.write = oldWrite
  }

  function hookedWrite(chunk, encoding, callback) {
    try {
      stdouts.push(Buffer.from(chunk instanceof Buffer ? chunk : String(chunk), encoding))
    } catch (e) {
      // ignore buffering errors
    }
    oldWrite(chunk, encoding, callback)
    if (stdouts.length > maxLength) stdouts.shift()
  }

  process.stdout.write = hookedWrite

  const state = {
    disable,
    isModified: true,
    logs: () => Buffer.concat(stdouts)
  }

  return state
}

export const isModified = false
export function logs() { return Buffer.concat(stdouts) }
