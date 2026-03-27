¡A la orden, amigo! Aquí tienes el código completamente limpio, en formato Markdown puro, listo para que lo pegues en tu README.md. He condensado todo en bloques de comandos "combo" para que tus usuarios solo tengan que copiar y pegar.
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

Copia y pega los siguientes bloques de comandos en tu terminal.

### 1️⃣ Preparar Entorno (Node.js v24 & FFmpeg)
Este comando instala el gestor de versiones, Node.js 24 y las librerías multimedia:

```bash
curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh) | bash && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 24 && nvm use 24 && nvm alias default 24 && sudo apt update && sudo apt install ffmpeg -y

2️⃣ Clonar y Preparar Bot
Descarga el repositorio e instala todas las dependencias necesarias:
git clone [https://github.com/SINNOMBRE22/Eris-MD.git](https://github.com/SINNOMBRE22/Eris-MD.git) && cd Eris-MD && npm install && mkdir -p tmp && chmod 777 tmp

3️⃣ Iniciar 24/7 con PM2
Usa el script de auto-configuración para que el bot nunca se apague:
chmod +x pm2-bot.sh && bash pm2-bot.sh

⚙️ Configuración (config.js)
Edita el archivo de configuración para que el bot te reconozca como dueño:
global.owner = [
  ['525629885039', 'SINNOMBRE22 💖', true], 
]
global.packname = 'Eris-MD' 
global.author = 'SINNOMBRE22 🌸'
global.prefix = ['/'] 

🎒 Categorías de Comandos
| Categoría | Descripción |
|---|---|
| 🏯 Grupo | Administración, antilink, bienvenida y gestión. |
| 🌸 Anime | Comandos de waifus, fotos y búsqueda de series. |
| 🎮 Juegos | Minijuegos interactivos (RPG, Trivia, etc). |
| 🛠️ Tools | Creación de stickers, traductor y utilidades. |
| 📥 Descargas | Contenido de YouTube, TikTok, IG y FB. |
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

**¿Te ayudo a subirlo de una vez con el `git push` o prefieres editar algo más antes?**

