<p align="center">
  <img src="https://i.pinimg.com/originals/60/76/8a/60768a1834162e2ac1894d36f6d525be.gif" alt="Eris-MD" width="350"/>
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

### 1️⃣ Preparar Entorno (Node.js v24 & FFmpeg)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 24 && nvm use 24 && nvm alias default 24 && sudo apt update && sudo apt install ffmpeg -y
```

### 2️⃣ Clonar y Preparar Bot
` ` `bash
git clone https://github.com/SINNOMBRE22/Eris-MD.git && cd Eris-MD && npm install && mkdir -p tmp && chmod 777 tmp
` ` `

### 3️⃣ Iniciar 24/7 con PM2
` ` `bash
chmod +x pm2-bot.sh && bash pm2-bot.sh
` ` `

---

## ⚙️ Configuración (`config.js`)
` ` `js
global.owner = [
  ['525629885039', 'SINNOMBRE22 💖', true],
]
global.packname = 'Eris-MD'
global.author = 'SINNOMBRE22 🌸'
global.prefix = ['/']
` ` `

---

## 🤝 Soporte y Contacto

<p align="center">
  <a href="https://wa.me/525629885039">
    <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp">
  </a>
</p>

<p align="center">
  Desarrollado con ❤️ por <a href="https://github.com/SINNOMBRE22">SINNOMBRE22</a>.<br>
  <i>¡No olvides dejar tu ⭐ si te sirvió el bot!</i>
</p>
