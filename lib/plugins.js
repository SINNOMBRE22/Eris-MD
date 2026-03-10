import { readdirSync, existsSync, readFileSync, watch } from 'fs'
import { join, resolve } from 'path'
import { format } from 'util'
import syntaxerror from 'syntax-error'
import importFile from './import.js'
import Helper from './helper.js'
import chalk from 'chalk'

const __dirname = Helper.__dirname(import.meta)
const pluginFolder = join(__dirname, '../plugins')
const pluginFilter = filename => /\.(mc)?js$/.test(filename)

let watcher = {}
let plugins = {}
let pluginFolders = []

async function filesInit(targetFolder = pluginFolder, filter = pluginFilter, conn) {
  const folder = resolve(targetFolder)
  if (folder in watcher) return
  pluginFolders.push(folder)

  await Promise.all(readdirSync(folder).filter(filter).map(async filename => {
    try {
      let file = global.__filename(join(folder, filename))
      const module = await import(file)
      if (module) plugins[filename] = 'default' in module ? module.default : module
    } catch (e) {
      conn?.logger?.error?.(e)
      delete plugins[filename]
    }
  }))

  const watching = watch(folder, reload.bind(null, conn, folder, filter))
  watching.on('close', () => deletePluginFolder(folder, true))
  watcher[folder] = watching

  conn?.logger?.info?.(chalk.green(`Plugins cargados en: ${folder}`))
  return plugins
}

function deletePluginFolder(folder, isAlreadyClosed = false) {
  const resolved = resolve(folder)
  if (!(resolved in watcher)) return
  if (!isAlreadyClosed) watcher[resolved].close()
  delete watcher[resolved]
  pluginFolders.splice(pluginFolders.indexOf(resolved), 1)
}

async function reload(conn, pluginFolderPath = pluginFolder, pluginFilterLocal = pluginFilter, _ev, filename) {
  if (!filename || !pluginFilterLocal(filename)) return
  let dir = global.__filename(join(pluginFolderPath, filename), true)
  if (filename in plugins) {
    if (existsSync(dir)) conn?.logger?.info?.(` updated plugin - '${filename}'`)
    else {
      conn?.logger?.warn?.(`deleted plugin - '${filename}'`)
      return delete plugins[filename]
    }
  } else conn?.logger?.info?.(`new plugin - '${filename}'`)
  let err = syntaxerror(readFileSync(dir), filename, {
    sourceType: 'module',
    allowAwaitOutsideFunction: true
  })
  if (err) conn?.logger?.error?.(`syntax error while loading '${filename}'\n${format(err)}`)
  else try {
    const module = await importFile(global.__filename(dir)).catch(console.error)
    if (module) plugins[filename] = module
  } catch (e) {
    conn?.logger?.error?.(`error require plugin '${filename}\n${format(e)}'`)
  } finally {
    plugins = Object.fromEntries(Object.entries(plugins).sort(([a], [b]) => a.localeCompare(b)))
  }
}

export { pluginFolder, pluginFilter, plugins, watcher, pluginFolders, filesInit, deletePluginFolder, reload }
