¡Entendido, amigo! Vamos a dejarlo súper limpio, directo al grano y con los comandos de Node que usamos hoy para que cualquier usuario solo tenga que copiar, pegar y listo. He quitado toda la paja y me enfoqué en una instalación técnica perfecta.
Aquí tienes el código para tu README.md:
<p align="center">
  <img src="https://i.pinimg.com/originals/60/76/8a/60768a1834162e2ac1894d36f6d525be.gif" alt="Eris GIF" width="350"/>
</p>

<h1 align="center"> 🌸 Ｅｒｉｓ － ＭＤ 🌸 </h1>
<p align="center">
  <b>Bot de WhatsApp Multi-Device rápido, optimizado y con estilo anime. ✨</b>
</p>

<p align="center">
  <a href="https://github.com/SINNOMBRE22/Eris-MD/stargazers"><img src="https://img.shields.io/github/stars/SINNOMBRE22/Eris-MD?color=ff69b4&style=for-the-badge&logo=github" alt="Stars"></a>
  <a href="https://github.com/SINNOMBRE22/Eris-MD/network/members"><img src="https://img.shields.io/github/forks/SINNOMBRE22/Eris-MD?color=ff69b4&style=for-the-badge&logo=github" alt="Forks"></a>
  <a href="#"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge&logo=react" alt="Maintained"></a>
</p>

---

## 🚀 Instalación Rápida (VPS / Linux)

Sigue estos bloques de comandos para dejar el bot funcionando desde cero.

### 1️⃣ Instalar Node.js v24 & FFmpeg
Copia y pega este bloque para configurar el entorno necesario:

```bash
# Instalar NVM e instalar Node v24 (LTS)
curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh) | bash && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 24 && nvm use 24 && nvm alias default 24

# Instalar FFmpeg para multimedia y stickers
sudo apt update && sudo apt install ffmpeg -y

2️⃣ Clonar y Configurar Librerías
Ahora descarga el bot y prepara las dependencias:
# Clonar repositorio
git clone [https://github.com/SINNOMBRE22/Eris-MD.git](https://github.com/SINNOMBRE22/Eris-MD.git) && cd Eris-MD

# Instalar dependencias y crear carpeta temporal
npm install && mkdir -p tmp && chmod 777 tmp

3️⃣ Iniciar con PM2 (24/7 Activo)
Para que el bot se mantenga encendido siempre, usa el script automatizado:
chmod +x pm2-bot.sh && bash pm2-bot.sh

⚙️ Configuración (config.js)
Edita el archivo config.js para personalizar tu bot:
global.owner = [
  ['525629885039', 'SINNOMBRE22 💖', true], // Tu número
]
global.packname = 'Eris-MD' 
global.author = 'SINNOMBRE22 🌸'
global.prefix = ['/'] 

🎒 Categorías de Comandos
| Categoría | Descripción |
|---|---|
| 🏯 Grupo | Gestión de usuarios, ban, kick y avisos. |
| 🌸 Anime | Comandos de waifus, fotos y búsqueda anime. |
| 🎮 Juegos | Minijuegos interactivos dentro de WhatsApp. |
| 🛠️ Tools | Stickers, traductores y utilidades. |
| 📥 Descargas | YouTube, TikTok, Instagram y Facebook. |
🤝 Soporte y Contacto
<p align="center">
<a href="https://www.google.com/search?q=https://wa.me/525629885039%3Ftext%3DHola%2520SINNOMBRE22,%2520vengo%2520de%2520GitHub">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/WhatsApp-25D366%3Fstyle%3Dfor-the-badge%26logo%3Dwhatsapp%26logoColor%3Dwhite" alt="WhatsApp Support">
</a>
</p>
<p align="center">
Desarrollado con ❤️ por <a href="https://www.google.com/search?q=https://github.com/SINNOMBRE22">SINNOMBRE22</a>.


<i>¡No olvides dejar tu ⭐ si te sirvió el bot!</i>
</p>

-----

### Lo que actualicé para ti:

  - **Node.js:** Puse el comando exacto de NVM que usamos hoy para instalar la **v24**.
  - **Comandos Combo:** Los agrupé para que el usuario solo tenga que dar un clic a "copiar".
  - **Identidad:** Ya puse tu número y nombre real en los ejemplos de configuración y soporte.
  - **Limpieza Total:** Fuera textos largos, ahora es una guía técnica 100% funcional.

¿Te late como quedó? Si quieres, puedo ayudarte a crear el script `pm2-bot.sh` si todavía no lo tienes listo para que haga la instalación de PM2 automáticamente.

