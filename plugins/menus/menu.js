import axios from 'axios';

const handler = async (m, { conn, usedPrefix }) => {
    try {
        // --- CONFIGURACIÓN DE ESTILOS ---
        const styles = {
            header: "╾╾╾╾ ⌬ @category ⌬ ╾╾╾╾",
            body: "  ➥ @cmd",
            footer: " "
        };

        // --- CÁLCULO DE DATOS DEL SISTEMA ---
        const name = await conn.getName(m.sender);
        const muptime = formatUptime(process.uptime());
        const chats = Object.keys(conn.chats);
        const grupos = chats.filter(id => id.endsWith('@g.us')).length;
        const privados = chats.length - grupos;
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalPlugins = Object.keys(global.plugins).length;

        // --- DISEÑO DE CABECERA (KAIROS-BOT) ---
        let headerInfo = `
╾╾╾╾╾╾╾╾༺༻╾╾╾╾╾╾╾╾
        *🜲 KAIROS - BOT 🜲*
╾╾╾╾╾╾╾╾༺༻╾╾╾╾╾╾╾╾
${toBold('Estado:')} ▹ Activo ◃
${toBold('Activo:')} ▹ ${muptime} ◃
${toBold('Prefijo:')} ▹ [ ${usedPrefix} ] ◃
${toBold('Ram:')} ▹ ${ram} MB ◃
${toBold('Grupos:')} ▹ ${grupos} ◃
${toBold('Privados:')} ▹ ${privados} ◃
${toBold('Plugins:')} ▹ ${totalPlugins} ◃
╾╾╾╾╾╾╾╾༺༻╾╾╾╾╾╾╾╾
「 *EL ARQUITECTO* 」
» wa.me/5215629885039
╾╾╾╾╾╾╾╾༺༻╾╾╾╾╾╾╾╾
         *🜲 COMANDOS DISPONIBLES 🜲*`;

        const readMore = String.fromCharCode(8206).repeat(1500);

        // --- LÓGICA AUTÓNOMA DE DETECCIÓN DE COMANDOS ---
        // Extraemos la información directamente de global.plugins
        const help = Object.values(global.plugins)
            .filter(p => !p.disabled && p.help && p.tags)
            .map(p => ({
                help: Array.isArray(p.help) ? p.help : [p.help],
                tags: Array.isArray(p.tags) ? p.tags : [p.tags],
                prefix: 'customPrefix' in p
            }));

        // Obtenemos categorías únicas y las ordenamos alfabéticamente
        const categories = [...new Set(help.flatMap(p => p.tags))].sort();

        // Generamos cada sección del menú
        let menuList = categories.map(tag => {
            const commands = help
                .filter(p => p.tags.includes(tag))
                .flatMap(p => p.help.map(h => {
                    return styles.body
                        .replace('@cmd', p.prefix ? h : usedPrefix + h)
                        .trim();
                })).join('\n');

            if (!commands) return '';

            const categoryName = tag.toUpperCase();
            return styles.header.replace('@category', categoryName) + '\n' + commands + '\n' + styles.footer;
        }).filter(section => section.trim() !== "").join('\n');

        let menuText = `${headerInfo}\n${readMore}\n${menuList}`.trim();

        // --- IMAGEN Y ENVÍO ---
        let thumb;
        try {
            const response = await axios.get('https://i.postimg.cc/zD6LSDZr/IMG-20250509-WA0013.jpg', {
                responseType: 'arraybuffer',
                timeout: 5000
            });
            thumb = response.data;
        } catch {
            thumb = Buffer.alloc(0); 
        }

        await conn.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                externalAdReply: {
                    title: 'ㅤㅤㅤ🜲 KAIROS SYSTEM 🜲',
                    body: `Usuario: ${toBoldUnicode(name)}`,
                    thumbnail: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error('Error en el menú:', e);
        conn.reply(m.chat, `❎ Ocurrió un fallo al generar el menú autónomo.`, m);
    }
};

handler.help = ['menu'];
handler.tags = ['info'];
handler.command = /^(menu|help|comandos|commands|cmd|cmds)$/i;

export default handler;

// --- FUNCIONES AUXILIARES ---
function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

function toBold(text) {
    return `*${text}*`;
}

function toBoldUnicode(text) {
    const fonts = {
        A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
        a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
        0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵'
    };
    return text.split('').map(c => fonts[c] || c).join('');
}
