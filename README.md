<p align="center">
  <img src="https://i.pinimg.com/originals/60/76/8a/60768a1834162e2ac1894d36f6d525be.gif" alt="Eris GIF" width="350"/>
</p>

<h1 align="center"> 🌸 Ｅｒｉｓ － ＭＤ 🌸 </h1>
<p align="center">
  <b>El bot de WhatsApp más rápido, completo y con todo el estilo anime que necesitas. ✨</b>
</p>

<p align="center">
  <a href="https://github.com/SINNOMBRE22/Eris-MD/stargazers"><img src="https://img.shields.io/github/stars/SINNOMBRE22/Eris-MD?color=ff69b4&style=for-the-badge&logo=github" alt="Stars"></a>
  <a href="https://github.com/SINNOMBRE22/Eris-MD/network/members"><img src="https://img.shields.io/github/forks/SINNOMBRE22/Eris-MD?color=ff69b4&style=for-the-badge&logo=github" alt="Forks"></a>
  <a href="#"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge&logo=react" alt="Maintained"></a>
</p>

---

## 🎐 ¿Qué es Eris-MD?

¡Hola! Soy **Eris-MD**, un bot multifuncional para WhatsApp basado en la tecnología Multi-Device (MD). He sido creada por **SINNOMBRE22** para hacer tus grupos más divertidos, gestionar la seguridad y ofrecerte herramientas útiles, ¡todo con un toque de magia anime!

---

## 🎒 Características Mágicas

| Categoría | Descripción | Comandos Destacados |
| :---: | :--- | :--- |
| **🏯 Grupo** | Mantén el orden en tu aldea. | `/kick`, `/add`, `/promote`, `/demote`, `/mute` |
| **🌸 Anime** | ¡Lo mejor de la cultura otaku! | `/anime [nombre]`, `/manga`, `/character`, `/waifu` |
| **🎮 Juegos** | Diversión para no aburrirse. | `/tictactoe`, `/trivia`, `/akinator`, `/slots` |
| **🛠️ Tools** | Herramientas útiles diarias. | `/sticker`, `/translate`, `/google`, `/weather` |
| **📥 Descargas** | Baja contenido de tus redes. | `/play` (YT), `/tiktok`, `/ig`, `/facebook` |
| **🎭 Owner** | Solo para mi creador. | `/setprefix`, `/broadcast`, `/block`, `/banchat` |

---

## 🚀 Instalación en PC / VPS (Recomendado)

Para que funcione al 100%, sigue estos pasos en tu terminal.

### 📋 Requisitos Previos
Antes de empezar, asegúrate de tener instalado lo siguiente:
- **Node.js v20 o superior** (Se recomienda v24 LTS para mejor rendimiento)
- **Git**
- **FFmpeg** (Esencial para stickers y multimedia)

> **Tip para Ubuntu/VPS:** Instala FFmpeg con: `sudo apt update && sudo apt install ffmpeg -y`

### 🛠️ Pasos para Instalar

```bash
# 1. Clona el repositorio
git clone [https://github.com/SINNOMBRE22/Eris-MD.git](https://github.com/SINNOMBRE22/Eris-MD.git)

# 2. Entra al directorio
cd Eris-MD

# 3. Instala las dependencias
npm install

# 4. Crea la carpeta de temporales (Evita errores en stickers)
mkdir -p tmp && chmod 777 tmp

⚡ Inicio Automático con PM2 (24/7)
Para que el bot no se apague y se reinicie solo si hay errores, usa el script de instalación automática:
# Dale permisos al script y ejecútalo
chmod +x pm2-bot.sh
bash pm2-bot.sh

Este script instalará PM2 por ti y dejará al bot corriendo de fondo.
⚙️ Configuración (config.js)
No olvides editar el archivo config.js para que el bot te reconozca como su dueño:
global.owner = [
  ['521234567890', 'Mi Creador 💖', true], // Cambia por tu número y nombre
]

global.packname = 'Sticker de' // Nombre del pack de stickers
global.author = 'Eris-MD 🌸' // Autor del sticker
global.prefix = ['/'] // Tu prefijo preferido

🤝 Soporte y Contacto
¿Encontraste un bug o tienes una idea genial? ¡Házmelo saber!
<p align="center">
<a href="https://www.google.com/search?q=https://wa.me/525629885039%3Ftext%3DHola%2520SINNOMBRE22,%2520tengo%2520una%2520duda%2520sobre%2520Eris-MD">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/WhatsApp-25D366%3Fstyle%3Dfor-the-badge%26logo%3Dwhatsapp%26logoColor%3Dwhite" alt="WhatsApp Support">
</a>
</p>
<p align="center">
Desarrollado con ❤️ por <a href="https://www.google.com/search?q=https://github.com/SINNOMBRE22">SINNOMBRE22</a>.


<i>¡No olvides dejar tu ⭐ si te gustó el proyecto!</i>
</p>

-----

### ¿Qué cambios hice?

1.  **Versión de Node:** Actualicé el requisito a **v20/v24**, que es lo que acabamos de dejar listo en tu servidor.
2.  **Carpeta tmp:** Añadí el comando `mkdir -p tmp` en los pasos de instalación para que los nuevos usuarios no sufran el error que te salió a ti.
3.  **FFmpeg:** Puse una nota clara de que es esencial y cómo instalarlo en Ubuntu.
4.  **PM2 Script:** Añadí la sección específica para tu script `pm2-bot.sh`, explicando que es la forma de dejarlo activo 24/7.
5.  **Limpieza:** Eliminé cualquier referencia a funciones de voz o IA que ya no estés usando.


