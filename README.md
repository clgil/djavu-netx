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

# opcional: activar proveedor explícito
NEXT_PUBLIC_DB_PROVIDER=mysql
```

> Si no defines variables de Supabase, la app arranca en **mock DB mode** (sin crash) mientras conectas MySQL mediante tu capa API/backend.

> Importante: en **mock DB mode** las pantallas cargan sin crash, pero **login/registro real no funciona** hasta que conectes backend de autenticación para MySQL o vuelvas a configurar Supabase Auth.
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


## Mejoras funcionales implementadas

### Sistema automático de Órdenes de Servicio

- Generación automática cuando un pedido tiene mueble personalizado o cuando el pedido queda en estado `deposit_paid`.
- Registro en tabla `service_orders` con:
  - número de orden de servicio
  - especificaciones técnicas
  - QR de seguimiento
  - PDF embebido en base64 (`technical_specifications.service_order_pdf_base64`).
- Disponible para descarga desde el panel de cliente (detalle de pedido).

### Sistema automático de Facturación

- Generación automática de factura cuando:
  - pedido estándar pagado al 100%
  - pedido personalizado pagado al 50% (depósito) o 100%.
- Registro histórico en tabla `invoices`.
- PDF embebido en base64 (`items_detail.invoice_pdf_base64`) y descargable desde detalle de pedido.
- Soporte para KPIs financieros en dashboard.

### Checkout con métodos de pago extendidos

- Métodos soportados:
  - Transferencia bancaria
  - Efectivo
  - PayPal (simulado)
  - Stripe (simulado)
  - Tropipay (simulado)
  - Qbapay (simulado)
- Para transferencia/efectivo se exige comprobante adjunto.
- Modalidad de cobro:
  - estándar: pago 100%
  - personalizado: 50% o 100%.

### Calculadora reactiva en personalización

- Cálculo en tiempo real ante cambios en:
  - dimensiones
  - tipo de madera
  - acabado
  - extras.
- Integrada con `cost_sheets` activa (mano de obra, margen, overhead y complejidad por tipo).

### Dashboard avanzado (Sales Manager)

Incluye métricas ampliadas:

- facturación total
- ingresos totales
- depósitos recibidos
- balance pendiente
- ingresos por período (7/30 días)
- ingresos por método de pago
- órdenes en producción
- tipo de mueble personalizado más solicitado
- tiempo promedio estimado de fabricación

### Gestión de productos (CRUD)

Nueva pantalla admin para:

- crear productos
- editar productos
- eliminar productos
- activar/desactivar
- gestionar múltiples imágenes por URL (primera como principal)


## Autenticación JWT (propia)

El proyecto ahora incluye autenticación propia con JWT + cookie httpOnly:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

La cookie usada es: `djavu_token`.

## Prisma + MySQL

Archivo principal: `prisma/schema.prisma`

### Variables mínimas

```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/djavu_netx"
JWT_SECRET="cambia-este-secreto-en-produccion"
```

### Comandos

```bash
npm run prisma:generate
npm run prisma:migrate
npm run setup:admin
```

> `setup:admin` ejecuta el seed para crear/actualizar el usuario administrador con las variables `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NAME`.

## Uso por rol

### Cliente (CLIENT)
- Registro/login
- Navegar catálogo
- Comprar y gestionar pedidos

### Gestor (GESTOR)
- Todo cliente
- Panel de gestión (`/gestor`)
- Gestión de productos y seguimiento de órdenes

### Administrador (ADMIN)
- Acceso completo a `/admin`
- Gestión global y reportes
- Gestión de usuarios/roles



## Guía completa

Para instalación, configuración y despliegue paso a paso (incluyendo seed de admin):

- `INSTALLATION_AND_DEPLOYMENT.md`
