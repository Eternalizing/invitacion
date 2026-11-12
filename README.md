# ✉️ Invitación Digital Oficial — Atef Nemer Grupo de Empresas (50 Años)

Web interactiva de invitación desarrollada con **React**, **Vite** y **Tailwind CSS**, diseñada fielmente a la línea gráfica oficial de lujo de **Atef Nemer Grupo de Empresas** para conmemorar su 50.º aniversario.

---

## 🌟 Características Principales

1. **Sobre de Gala Inicial:**
   - Silueta con solapa dorada y sello de cera oficial "50" en relieve 3D interactivo.
   - Nombre personalizado del invitado en letras doradas mayúsculas con espaciado editorial.
   - Revelación cinematográfica secuencial con los logotipos oficiales de *Atef Nemer Grupo de Empresas* y *50 Años* con fundido cruzado suave.
   - Sin música, sin sonidos y sin confeti innecesario (diseño sobrio y elegante).

2. **Landing Page Conmemorativa:**
   - **Cabecera oficial:** Logotipo oficial Atef Nemer Grupo de Empresas + Logotipo oficial 50 Años.
   - **Invitación Personal:** Nombre del invitado con tipografía cursiva serif dorada de alta gama.
   - **Contador Regresivo:** Contador dinámico en página y barra flotante inteligente al hacer scroll.
   - **Programa del Evento:** Misa de Acción de Gracias (5:30 p.m.), Recepción (7:00 p.m.) y Conclusión del evento (12:00 a.m.).
   - **Ubicación & Código de Vestimenta:** Salón Principal, Eurobuilding Barinas con enlace interactivo a Google Maps y etiqueta "Cóctel".
   - **Libro Conmemorativo Interactivo:** Sección desplegable con animación 3D de páginas para descubrir el libro de los 50 años.
   - **Galería de Momentos (27 fotos históricas):** Carrusel de 3 filas en movimiento infinito continuo y direcciones alternadas (pausa al posar el cursor y visor Lightbox a pantalla completa).
   - **Confirmación de Asistencia (RSVP):** Botones de confirmación y declinación enlazados a Google Forms.

---

## 👤 Cómo Personalizar el Nombre del Invitado en el Enlace

El sistema detecta automáticamente el nombre desde el parámetro `?to=` en la URL:

- `https://tu-proyecto.vercel.app/?to=Martha+Villamizar`
- `https://tu-proyecto.vercel.app/?to=Dr.+Carlos+Mendoza`
- `https://tu-proyecto.vercel.app/?to=Ing.+Alejandro+Hernandez`

*(Si no se incluye ningún parámetro en la URL, el sistema muestra por defecto "Martha Villamizar").*

---

## 🚀 Despliegue en Vercel

### Opción 1: Conectar Repositorio de GitHub en Vercel (Recomendado)
1. Sube tu proyecto a un repositorio en tu cuenta de GitHub:
   ```bash
   git init
   git add .
   git commit -m "Invitacion oficial 50 Anos Atef Nemer"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
2. Entra en [vercel.com](https://vercel.com) e inicia sesión con GitHub.
3. Haz clic en **"Add New..."** -> **"Project"**.
4. Selecciona tu repositorio y haz clic en **"Import"**.
5. Vercel detectará automáticamente **Vite** y configurará:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Haz clic en **"Deploy"**. En menos de 1 minuto tu invitación estará en línea con HTTPS y CDN mundial.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Generar compilación de producción para probar
npm run build
```
