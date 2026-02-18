# Djavu NetX — Next.js 14 + Supabase

Aplicación ecommerce para muebles personalizados migrada a **Next.js 14 (App Router)** con **TypeScript**, **TailwindCSS**, **shadcn/ui** y **Supabase**.

---

## Stack principal

- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- Supabase (auth + base de datos)
- TanStack Query

---

## Requisitos previos

- Node.js 18.18+ (recomendado Node 20 LTS)
- npm 9+
- Proyecto Supabase activo

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<tu-anon-public-key>
```

> Estas variables son obligatorias para autenticación, lectura/escritura de datos y sesión.

---

## Ejecución local (desarrollo)

1. **Clonar repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd djavu-netx
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar entorno**
   - Crear `.env.local` con las variables anteriores.

4. **Levantar servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir aplicación**
   - `http://localhost:3000`

---

## Build y ejecución local en modo producción

1. Generar build:

```bash
npm run build
```

2. Ejecutar servidor de producción:

```bash
npm run start
```

3. Abrir:
- `http://localhost:3000`

---

## Despliegue en Hostinger (Node Hosting compartido)

Este proyecto está preparado con `output: "standalone"` en `next.config.js`.

### 1) Preparar proyecto para deploy

En local:

```bash
npm install
npm run build
```

Se generará `.next/standalone` y `.next/static`.

### 2) Archivos/directorios que debes subir al hosting

Sube al servidor (por ejemplo por SFTP/Administrador de archivos):

- `.next/standalone/` (contenido)
- `.next/static/`
- `public/`
- `package.json`
- `next.config.js`

> Si Hostinger te exige carpeta de aplicación específica (ej. `app/`), respeta esa ruta y sube ahí estos archivos.

### 3) Configurar variables de entorno en Hostinger

En el panel de Node.js de Hostinger, define:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NODE_ENV=production`
- `PORT` (si Hostinger no lo inyecta automáticamente)

### 4) Configurar comando de inicio

Según el panel de Hostinger:

- **Startup file**: `server.js` (incluido en standalone)
- o **Start command**: `node server.js`

> Si subiste el contenido de `.next/standalone` dentro de una subcarpeta, ajusta la ruta (ej. `node standalone/server.js`).

### 5) Reiniciar aplicación

- Reinicia el servicio Node.js desde el panel.
- Verifica que la app abra y que autenticación y consultas a Supabase funcionen.

---

## Checklist post-despliegue

- [ ] Carga homepage correctamente.
- [ ] Login/registro en Supabase funciona.
- [ ] Catálogo de productos carga desde base de datos.
- [ ] Carrito y checkout operativos.
- [ ] Panel admin accesible para usuarios con rol manager.

---

## Scripts disponibles

```bash
npm run dev      # desarrollo
npm run build    # build producción
npm run start    # ejecutar build en producción
npm run lint     # lint
```
