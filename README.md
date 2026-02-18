# Djavu NetX — Next.js 14 + MySQL

Aplicación ecommerce de muebles personalizados ejecutándose en **Next.js 14 (App Router)** con base de datos **MySQL 8** para entorno local y despliegue en Hostinger.

---

## Stack

- Next.js 14 + App Router
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- MySQL 8

---

## Estructura de base de datos MySQL

Se añadió el esquema completo migrado desde Supabase/PostgreSQL a MySQL en:

- `database/mysql/schema.sql`

Incluye:

- tablas principales (`profiles`, `products`, `orders`, `order_items`, `service_orders`, etc.)
- extensiones funcionales (`coupons`, `shipping_methods`, `invoices`, `affiliates`, `affiliate_commissions`, `stock_movements`, `activity_logs`)
- `ENUM` equivalentes para roles, estado de pedido, tipo de mueble y método de pago
- triggers para numeración automática de `orders`, `service_orders` e `invoices`
- seed de métodos de envío para Cuba

---

## Requisitos previos

- Node.js 18.18+ (recomendado Node 20 LTS)
- npm 9+
- MySQL 8+

---

## Variables de entorno

Crea `.env.local`:

```bash
NODE_ENV=development

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MySQL
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=djavu_netx
```

> Si usas SSL en producción (Hostinger), añade variables SSL según tu panel.

---

## Levantar la base de datos local

1. Crear base de datos y estructura:

```bash
mysql -u root -p < database/mysql/schema.sql
```

2. Verificar tablas:

```bash
mysql -u root -p -e "USE djavu_netx; SHOW TABLES;"
```

---

## Ejecutar el proyecto localmente

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar en desarrollo:

```bash
npm run dev
```

3. Abrir:

- `http://localhost:3000`

---

## Build local (modo producción)

```bash
npm run build
npm run start
```

---

## Despliegue en Hostinger (Node Hosting compartido + MySQL)

> El proyecto está configurado con `output: "standalone"` en `next.config.js`.

### 1) Preparar build

```bash
npm install
npm run build
```

### 2) Archivos a subir

Sube al hosting:

- `.next/standalone/` (contenido)
- `.next/static/`
- `public/`
- `package.json`
- `next.config.js`

### 3) Configurar MySQL en Hostinger

1. Crea una base de datos MySQL desde hPanel.
2. Crea usuario y permisos sobre esa base.
3. Importa `database/mysql/schema.sql` desde phpMyAdmin o por consola.

### 4) Variables de entorno en Hostinger

Configura en el panel Node.js:

```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
MYSQL_HOST=<host_mysql_hostinger>
MYSQL_PORT=3306
MYSQL_USER=<usuario_mysql>
MYSQL_PASSWORD=<password_mysql>
MYSQL_DATABASE=<base_mysql>
```

### 5) Startup command

- Startup file: `server.js`
- o comando: `node server.js`

### 6) Reiniciar app

- Reinicia el proceso Node.js en Hostinger.
- Valida homepage, catálogo, checkout, pedidos y panel admin.

---

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## Nota de migración

Se migró el modelo de datos a MySQL y se incorporó el SQL equivalente al esquema original de Supabase en `database/mysql/schema.sql`.
