# 🚀 Twitter Lara - Guía de Lanzamiento

¡Felicidades! Has creado una red social premium. Ahora vamos a lanzarla al mundo.

## 1. Sube tu código a GitHub
1. Crea un repositorio nuevo en [github.com](https://github.com/) llamado `twitter-lara`.
2. En tu terminal, ejecuta estos comandos (dentro de la carpeta del proyecto):
```bash
git init
git add .
git commit -m "Lanzamiento oficial Twitter Lara"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/twitter-lara.git
git push -u origin main
```

## 2. Despliega en Cloudflare Pages
1. Entra en el panel de Cloudflare y ve a **Workers & Pages**.
2. Dale a **Create application** -> **Pages** -> **Connect to Git**.
3. Selecciona tu repositorio `twitter-lara`.
4. En **Build settings**, no toques nada (déjalo vacío).
5. Dale a **Save and Deploy**.

¡Listo! Cloudflare te dará una URL (ej: `twitter-lara.pages.dev`) y tu web estará online. Cada vez que hagas un `git push`, la web se actualizará sola.

## Estructura del Proyecto
- `index.html`: Base de la app y carga de Supabase.
- `app.js`: Lógica de navegación, publicaciones y likes.
- `style.css`: Diseño premium con glassmorphism.
- `config.js`: Tus llaves secretas de base de datos.
- `_redirects`: Para que la navegación (#) funcione siempre.

---
Hecho con ❤️ por Lara y su mentor AI.