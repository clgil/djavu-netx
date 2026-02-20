# Djavu — Guía completa de instalación, configuración y despliegue

Esta guía permite a cualquier persona levantar y desplegar el sistema Djavu con **Next.js + MySQL + Prisma + JWT**.

---

## 1) Requisitos

- Node.js 18.18+ (recomendado Node 20 LTS)
- npm 9+
- MySQL 8+
- Acceso al repositorio

---

## 2) Clonar e instalar

```bash
git clone <URL_DEL_REPO>
cd djavu-netx
npm install
```

---

## 3) Variables de entorno

Crea `.env` en la raíz:

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=pon-un-secreto-largo-y-seguro

# MySQL / Prisma
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/djavu_netx"

# Seed admin obligatorio
ADMIN_EMAIL=admin@djavu.local
ADMIN_PASSWORD=CambiaEstaClave123!
ADMIN_NAME=Administrador Djavu
```

> `JWT_SECRET` es obligatorio para firmar tokens.
> `DATABASE_URL` debe apuntar a tu base MySQL.

---

## 4) Inicializar base de datos con Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

Esto crea/aplica el esquema de `prisma/schema.prisma`.

---

## 5) Crear usuario administrador (seed)

El proyecto incluye seed para admin.

```bash
npm run prisma:seed
```

Qué hace:
- Crea o actualiza usuario `ADMIN` usando `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
- Actualiza nombre del admin.
- Crea categorías base.

También puedes usar:

```bash
npm run setup:admin
```

---

## 6) Ejecutar localmente

```bash
npm run dev
```

Abrir:
- http://localhost:3000
- Login: `/login`
- Admin: `/admin`

---

## 7) Flujo de autenticación

Rutas API implementadas:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

La sesión se mantiene con cookie httpOnly `djavu_token`.

Middleware por rol:
- `CLIENT`: rutas privadas generales
- `GESTOR`: acceso a `/gestor`
- `ADMIN`: acceso total `/admin`

---

## 8) Despliegue en Hostinger (Node + MySQL)

### 8.1 Build

```bash
npm install
npm run prisma:generate
npm run build
```

### 8.2 Subir archivos

Sube como mínimo:
- `.next/standalone/` (contenido)
- `.next/static/`
- `public/`
- `package.json`
- `next.config.js`
- `prisma/` (incluye `schema.prisma` y `seed.js`)

### 8.3 Variables de entorno en Hostinger

Configura en panel Node:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
JWT_SECRET=<secreto-fuerte>
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/djavu_netx"
ADMIN_EMAIL=admin@tu-dominio.com
ADMIN_PASSWORD=<password-inicial-fuerte>
ADMIN_NAME=Administrador
```

### 8.4 Inicializar DB en producción

En terminal del hosting (si está disponible):

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 8.5 Arranque

- Startup file: `server.js`
- o comando: `node server.js`

---

## 9) Verificación rápida post-despliegue

1. `/login` abre correctamente.
2. Login admin funciona con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
3. `/admin` accesible con admin.
4. Usuario CLIENT no puede entrar a `/admin`.
5. Usuario CLIENT sí puede entrar a rutas privadas de cliente.

---

## 10) Solución de problemas

### Error de autenticación JWT
- Verifica `JWT_SECRET` en entorno.
- Revisa reloj/fecha del servidor.

### Error Prisma
- Revisa `DATABASE_URL`.
- Ejecuta `npm run prisma:generate` y `npm run prisma:migrate`.

### No existe admin
- Asegúrate que `ADMIN_EMAIL` y `ADMIN_PASSWORD` estén definidos.
- Ejecuta `npm run prisma:seed`.

---

## 11) Comandos útiles

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run setup:admin
```
