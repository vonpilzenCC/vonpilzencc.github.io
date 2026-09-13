# 💀 La Guardia — Centro de Mando

Sitio portafolio de **Vonpilzen** (`@vonpilzenCC`): OSINT, seguridad espacial, análisis de firmware y radio definida por software.

El sitio es estático: muestra los proyectos del usuario en GitHub, con filtros por lenguaje y búsqueda en vivo. Los datos base están embebidos y se actualizan automáticamente desde la API pública de GitHub.

## 🎨 Estética
- Tema militar oscuro — fondo `#0a0a0a`, acentos rojo `#c20000`, tipografía Georgia serif + Courier mono para datos.
- Marca 💀 **La Guardia** / Centro de Mando.

## 📂 Estructura
| Archivo | Función |
|---|---|
| `index.html` | Estructura, enlaces a CSS y JS externos |
| `style.css` | Tema militar oscuro, responsive |
| `app.js` | Datos + renderizado + filtros + búsqueda + actualización en vivo |
| `.nojekyll` | Sirve archivos sin procesado Jekyll |

## 🚀 Activación (GitHub Pages)
1. Settings → Pages
2. Source: **Deploy from a branch** → `main` / **root**
3. Sitio: <https://vonpilzencc.github.io/>

## 🔧 Desarrollo local
Abre `index.html` en el navegador o sirve la carpeta con cualquier servidor estático.

---
MIT · Sin clasificar — solo fuentes abiertas.