# WoodCraft Pro - Guía de Despliegue Local

Esta guía explica cómo ejecutar WoodCraft Pro en un entorno local sin necesidad de acceso a internet (después de la instalación inicial).

## Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- [Node.js](https://nodejs.org/) v18+ (o [Bun](https://bun.sh/))
- Git

## 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd woodcraft-pro
```

## 2. Levantar Supabase Local con Docker

Crea el archivo `docker-compose.yml` en la raíz del proyecto:

```yaml
version: "3.8"

services:
  postgres:
    image: supabase/postgres:15.1.1.78
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data

  supabase-studio:
    image: supabase/studio:20240101-ce42139
    ports:
      - "3000:3000"
    environment:
      STUDIO_PG_META_URL: http://pg-meta:8080
      SUPABASE_URL: http://kong:8000
      SUPABASE_ANON_KEY: ${ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY}

  kong:
    image: kong:2.8.1
    ports:
      - "8000:8000"
      - "8443:8443"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
    volumes:
      - ./docker/kong.yml:/var/lib/kong/kong.yml

  gotrue:
    image: supabase/gotrue:v2.143.0
    ports:
      - "9999:9999"
    environment:
      GOTRUE_API_HOST: "0.0.0.0"
      GOTRUE_API_PORT: "9999"
      API_EXTERNAL_URL: http://localhost:8000
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://supabase_auth_admin:postgres@postgres:5432/postgres
      GOTRUE_SITE_URL: http://localhost:8080
      GOTRUE_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters
      GOTRUE_JWT_EXP: 3600
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_MAILER_AUTOCONFIRM: "true"

  postgrest:
    image: postgrest/postgrest:v12.0.1
    ports:
      - "3001:3000"
    environment:
      PGRST_DB_URI: postgres://authenticator:postgres@postgres:5432/postgres
      PGRST_DB_SCHEMAS: public,storage
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters

  pg-meta:
    image: supabase/postgres-meta:v0.83.2
    ports:
      - "8080:8080"
    environment:
      PG_META_PORT: 8080
      PG_META_DB_HOST: postgres
      PG_META_DB_PORT: 5432
      PG_META_DB_NAME: postgres
      PG_META_DB_USER: supabase
      PG_META_DB_PASSWORD: postgres

volumes:
  pgdata:
```

Levanta los servicios:

```bash
docker-compose up -d
```

## 3. Configurar Variables de Entorno Locales

Crea o edita el archivo `.env.local`:

```env
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_PUBLISHABLE_KEY=<tu-anon-key-local>
VITE_SUPABASE_PROJECT_ID=local
```

> **Nota:** Genera las claves JWT usando el secreto definido en `docker-compose.yml`.
> Puedes usar https://supabase.com/docs/guides/self-hosting para generar las claves.

## 4. Ejecutar las Migraciones

Aplica las migraciones de la base de datos:

```bash
# Usando psql directamente
for f in supabase/migrations/*.sql; do
  psql "postgresql://postgres:postgres@localhost:5432/postgres" -f "$f"
done
```

## 5. Instalar Dependencias y Ejecutar

```bash
# Instalar dependencias (requiere internet la primera vez)
npm install
# o
bun install

# Ejecutar en modo desarrollo
npm run dev
# o
bun run dev
```

La aplicación estará disponible en `http://localhost:8080`.

## 6. Crear el Usuario Administrador

Conéctate a la base de datos y ejecuta:

```sql
-- Primero crea el usuario en auth.users (si usas GoTrue local)
-- O regístrate manualmente en http://localhost:8080/auth

-- Después asigna el rol de administrador:
UPDATE public.user_roles 
SET role = 'sales_manager' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@woodcraftpro.com'
);
```

## 7. Datos de Prueba

Los datos semilla (tipos de madera, acabados, extras, productos) se insertan automáticamente con las migraciones.

## Estructura de Puertos

| Servicio       | Puerto |
|---------------|--------|
| App Frontend  | 8080   |
| Supabase API  | 8000   |
| PostgreSQL    | 5432   |
| Auth (GoTrue) | 9999   |
| PostgREST     | 3001   |
| Studio        | 3000   |

## Modo Offline

Una vez que hayas ejecutado `npm install` y `docker-compose up -d` al menos una vez con conexión a internet:

1. Todas las imágenes de Docker quedarán en caché local
2. Las dependencias de Node.js estarán en `node_modules/`
3. No se necesita internet para desarrollo posterior

Para verificar que todo funciona sin internet:
```bash
# Desconecta internet y ejecuta:
docker-compose up -d
npm run dev
```

## Producción

Para un despliegue en producción:

```bash
# Construir la aplicación
npm run build

# Los archivos estáticos se generan en dist/
# Sirve con cualquier servidor web (nginx, Apache, etc.)
```

### Ejemplo con Nginx:

```nginx
server {
    listen 80;
    server_name woodcraftpro.local;
    
    root /var/www/woodcraftpro/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires max;
        add_header Cache-Control "public, immutable";
    }
}
```
