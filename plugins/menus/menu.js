import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix }) => {
    try {
        const name = await conn.getName(m.sender)
        const styles = {
            header: "╾╾╾╾ ⌬ @category ⌬ ╾╾╾╾",
            body: "›  @cmd",
            footer: ""
        }

        const muptime = formatUptime(process.uptime())
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        const totalPlugins = Object.keys(global.plugins).length

        let headerInfo = `💖✌️ (Paz y Amor ✌️💖)

┣🎀 **RAM:** ${ram} MB
┣💞 **Live:** ${muptime}

--- 📂 **INFO** ---
🧩 Plugins: ${totalPlugins}

━━━━━━━━━━━━━━
👑 Dev: SINNOMBRE22
📱 wa.me/5215629885039

*Mis Comandos Disponibles*`

        const readMore = String.fromCharCode(8206).repeat(1500)

        const help = Object.values(global.plugins)
            .filter(p => !p.disabled && p.help && p.tags)
            .map(p => ({
                help: Array.isArray(p.help) ? p.help : [p.help],
                tags: Array.isArray(p.tags) ? p.tags : [p.tags],
                prefix: 'customPrefix' in p
            }))

        const categories = [...new Set(help.flatMap(p => p.tags))].sort()

        let menuList = categories.map(tag => {
            const commands = help
                .filter(p => p.tags.includes(tag))
                .flatMap(p => p.help.map(h => {
                    return styles.body.replace('@cmd', p.prefix ? h : usedPrefix + h)
                })).join('\n')

            if (!commands) return ''
            const categoryName = tag.toUpperCase()
            
            // Retornamos la categoría y sus comandos sin saltos extras al final
            return `${styles.header.replace('@category', categoryName)}\n${commands}`
        }).filter(section => section.trim() !== "").join('\n\n') // Un solo espacio de separación entre bloques

        let menuText = `${headerInfo}\n${readMore}\n${menuList}`.trim()

        let thumb
        try {
            const imgPath = path.join(process.cwd(), 'src/imagenes/perfil2.jpeg')
            thumb = fs.readFileSync(imgPath)
        } catch {
            thumb = Buffer.alloc(0)
        }

        await conn.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                externalAdReply: {
                    title: `🌸 ¡Hola! Soy ${toBoldUnicode("ERIS - MD")} 🌸`,
                    body: `🌷Usuario: ${toBoldUnicode(name)}`,
                    thumbnail: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        if (conn) conn.reply(m.chat, '❌ Error al generar el menú.', m)
    }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = /^(menu|help|comandos|commands|cmd|cmds)$/i

export default handler

function formatUptime(seconds){
    const h = Math.floor(seconds / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    return `${h}h ${m}m ${s}s`
}

function toBoldUnicode(text){
    if (!text) return ""
    const fonts = {
        A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
        a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
        0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵'
    }
    return String(text).split('').map(c => fonts[c] || c).join('')
}
