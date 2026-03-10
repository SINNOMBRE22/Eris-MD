import { readdirSync, statSync, readFileSync, existsSync, watch as fsWatch } from 'fs'
import path from 'path'
import syntaxerror from 'syntax-error'
import { pathToFileURL } from 'url'
import { format } from 'util'
import chalk from 'chalk'

/**
 * Init plugins system:
 * - Carga todos los archivos .js dentro de `pluginRoot` (recursivo).
 * - Guarda módulos en `global.plugins` usando rutas relativas dentro de pluginRoot (ej: "index/menu.js" o "descargas/downloader.js")
 * - Expone `global.reload` que acepta (event, filenameRelative) y recarga el plugin cambiado.
 * - Activa un watcher recursivo (fs.watch si soporta recursive, o watchers por subcarpeta).
 *
 * Uso (en index.js):
 * import initPlugins from './lib/plugins-loader.js'
 * await initPlugins(join(__dirname, './plugins'))
 *
 * Nota: Este módulo usa import dinámico con query `?update=${Date.now()}` para evitar cache de ES modules.
 */

function readPluginFiles(dir, base = '') {
  const entries = readdirSync(dir, { withFileTypes: true })
  let files = []
  for (const ent of entries) {
    const name = ent.name
    const full = path.join(dir, name)
    const rel = base ? path.posix.join(base, name) : name
    if (ent.isDirectory()) {
      files = files.concat(readPluginFiles(full, rel))
    } else if (ent.isFile() && /\.js$/.test(name)) {
      files.push(rel.replace(/\\/g, '/'))
    }
  }
  return files
}

async function importPlugin(fullPath) {
  // Use global.__filename to convert to importable URL if available, else pathToFileURL
  const fileUrl = (typeof global.__filename === 'function') ? global.__filename(fullPath) : pathToFileURL(fullPath).toString()
  // add cache-busting query
  return await import(`${fileUrl}?update=${Date.now()}`)
}

function createDirWatchers(root, cb) {
  // create watchers for each directory (recursive)
  const walk = (dir) => {
    try {
      const entries = readdirSync(dir, { withFileTypes: true })
      // watch current dir
      try {
        fsWatch(dir, (eventType, filename) => {
          if (!filename) return
          // Convert to posix relative path from root
          const rel = path.relative(root, path.join(dir, filename)).replace(/\\/g, '/')
          cb(eventType, rel)
        })
      } catch (e) {
        // ignore watcher error for this dir
      }
      for (const ent of entries) {
        if (ent.isDirectory()) walk(path.join(dir, ent.name))
      }
    } catch (e) {
      // ignore
    }
  }
  walk(root)
}

export default async function initPlugins(pluginRoot) {
  const pluginRootAbs = path.resolve(pluginRoot)
  global.pluginRoot = pluginRootAbs

  // ensure global.plugins exists
  global.plugins = global.plugins || {}

  // load all plugins (recursively)
  const pluginFiles = readPluginFiles(pluginRootAbs) // array of relative paths
  for (const rel of pluginFiles) {
    const full = path.join(pluginRootAbs, rel)
    try {
      const module = await importPlugin(full)
      global.plugins[rel] = module.default || module
    } catch (e) {
      console.error(chalk.red(`Error cargando plugin ${rel}:`), e)
      // keep going
    }
  }

  // define global.reload to handle single-file updates
  global.reload = async (_ev, filename) => {
    if (!filename) return
    // normalize filename (it can come as 'subdir/file.js' or just 'file.js')
    const rel = filename.replace(/\\/g, '/')
    const full = path.join(pluginRootAbs, rel)
    // if file removed -> delete from registry
    if (!existsSync(full)) {
      if (rel in global.plugins) {
        delete global.plugins[rel]
        console.log(chalk.yellow(`plugin eliminado: ${rel}`))
      }
      return
    }
    // check syntax before importing
    try {
      const code = readFileSync(full, 'utf8')
      const err = syntaxerror(code, rel, { sourceType: 'module', allowAwaitOutsideFunction: true })
      if (err) {
        console.error(chalk.red(`Error de sintaxis en plugin ${rel}:\n`), format(err))
        return
      }
    } catch (e) {
      console.error(chalk.red('No se pudo leer el plugin para verificar sintaxis:'), e)
    }

    try {
      const module = await importPlugin(full)
      global.plugins[rel] = module.default || module
      // keep ordering stable
      global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
      console.log(chalk.green(`plugin recargado: ${rel}`))
    } catch (e) {
      console.error(chalk.red(`Error recargando plugin ${rel}:`), e)
    }
  }

  // Set up watchers:
  // Try fs.watch with recursive option first (may not be supported in Linux), fallback to per-dir watchers
  try {
    // Attempt single recursive watcher
    fsWatch(pluginRootAbs, { recursive: true }, (eventType, filename) => {
      if (!filename) return
      const rel = filename.replace(/\\/g, '/')
      global.reload(eventType, rel)
    })
    console.log(chalk.cyanBright('Watcher en plugins (recursive) activo en:'), pluginRootAbs)
  } catch (e) {
    // fallback: create watchers per directory
    createDirWatchers(pluginRootAbs, (ev, rel) => {
      global.reload(ev, rel)
    })
    console.log(chalk.cyanBright('Watcher en plugins activo (por carpetas) en:'), pluginRootAbs)
  }

  return Object.keys(global.plugins)
}
