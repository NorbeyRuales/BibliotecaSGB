
# SGB Library Management System

Sistema web para gestion de biblioteca con roles de administrador y cliente.
El frontend esta construido con React + Vite y el backend usa Supabase Edge Functions con almacenamiento en PostgreSQL via una tabla tipo key-value.

## Tabla de contenido

1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Funciones principales](#funciones-principales)
3. [Stack tecnologico](#stack-tecnologico)
4. [Arquitectura](#arquitectura)
5. [Estructura del repo](#estructura-del-repo)
6. [Prerequisitos](#prerequisitos)
7. [Instalacion y ejecucion local](#instalacion-y-ejecucion-local)
8. [Configuracion de base de datos (Supabase)](#configuracion-de-base-de-datos-supabase)
9. [Despliegue de Edge Function](#despliegue-de-edge-function)
10. [Credenciales iniciales](#credenciales-iniciales)
11. [Scripts utiles](#scripts-utiles)
12. [Troubleshooting](#troubleshooting)
13. [Notas de seguridad y produccion](#notas-de-seguridad-y-produccion)

## Resumen del proyecto

El sistema cubre el flujo completo de una biblioteca:

- Catalogo publico para visitantes.
- Registro e inicio de sesion.
- Dashboard de administrador para operar el sistema.
- Dashboard de cliente para consultar catalogo, prestamos y multas.
- Registro de auditoria para acciones relevantes del sistema.

## Funciones principales

### Rol administrador

- Gestion de libros: crear, editar, eliminar logicamente, rehabilitar.
- Gestion de categorias: crear, editar, eliminar logicamente, rehabilitar.
- Gestion de usuarios/clientes: crear, editar, bloquear, desbloquear, eliminar logicamente.
- Gestion de prestamos: crear, devolver, desactivar, rehabilitar.
- Gestion de multas: crear, pagar, desactivar, rehabilitar.
- Reportes y estadisticas generales.
- Vista de logs de auditoria.

### Rol cliente

- Ver catalogo de libros.
- Consultar prestamos propios.
- Consultar multas propias.

### Publico (sin login)

- Catalogo publico desde rutas `/public/*` del backend.

## Stack tecnologico

- Frontend: React 18 + TypeScript + Vite.
- UI: componentes basados en Radix UI.
- Backend: Supabase Edge Functions (Hono).
- Auth: Supabase Auth.
- Datos: PostgreSQL en Supabase (`kv_store_bebfd31a` + tablas de auditoria).

## Arquitectura

El frontend consume una Edge Function principal:

- Function URL base esperada por el frontend: `https://<project-id>.supabase.co/functions/v1/make-server-bebfd31a`
- Cliente API: `src/utils/api.tsx`
- Configuracion de proyecto/anon key: `src/utils/supabase/info.tsx`

Flujo general:

1. UI (React) llama metodos de `apiClient`.
2. Edge Function valida token/rol.
3. Backend lee/escribe en Supabase (tabla key-value + logs).

## Estructura del repo

```text
.
|- src/
|  |- components/
|  |  |- admin/               # vistas de administracion
|  |  |- auth/                # login/registro
|  |  |- cliente/             # dashboard cliente
|  |  |- public/              # catalogo publico
|  |- context/                # AuthContext
|  |- hooks/                  # hooks custom (incluye auditoria)
|  |- utils/
|  |  |- api.tsx              # cliente HTTP al backend
|  |  |- auditoria.tsx        # utilidades de logs
|  |  |- supabase/info.tsx    # projectId y anon key
|  |- supabase/
|  |  |- setup.sql            # inicializacion BD
|  |  |- migration-logs-auditoria.sql
|  |  |- functions/
|  |     |- make-server-bebfd31a/
|  |     |- server/
|  |- deploy*.bat / deploy*.sh
|- package.json
|- vite.config.ts
```

## Prerequisitos

- Node.js 18+ (recomendado Node.js 20 LTS).
- npm.
- Cuenta en Supabase (si vas a desplegar backend propio).
- Supabase CLI (para deploy de Edge Functions).

## Instalacion y ejecucion local

En la raiz del proyecto:

```bash
npm install
npm run dev
```

Luego abre la URL que muestra Vite (por defecto `http://localhost:5173`).

Build de produccion:

```bash
npm run build
```

## Configuracion de base de datos (Supabase)

Para una instalacion limpia:

1. Abre el SQL Editor de tu proyecto Supabase.
2. Ejecuta primero el script base:
  - `src/supabase/setup.sql`
3. Si quieres habilitar o corregir auditoria, ejecuta:
  - `src/supabase/migration-logs-auditoria.sql`

Tambien existen scripts de mantenimiento, por ejemplo:

- `src/supabase/cleanup.sql`
- `src/supabase/cleanup-simplificado.sql`

Usalos con cuidado porque eliminan datos.

## Despliegue de Edge Function

### Opcion recomendada (manual con CLI)

Desde `src`:

```bash
supabase login
supabase link --project-ref <tu-project-ref>
supabase functions deploy make-server-bebfd31a --no-verify-jwt
```

### Opcion automatizada

Tambien puedes usar scripts del repo (ejecutar dentro de `src`):

- Windows: `deploy-completo.bat`
- Linux/macOS: `deploy-completo.sh`

## Credenciales iniciales

Despues de desplegar backend, inicializa admin:

```bash
curl -X POST "https://<project-id>.supabase.co/functions/v1/make-server-bebfd31a/setup/init-admin"
```

Credenciales por defecto:

- Email: `admin@biblioteca.com`
- Password: `admin123`
- Identificacion: `0000000000`

## Scripts utiles

### En raiz

- `npm run dev`: levanta frontend en modo desarrollo.
- `npm run build`: genera build de produccion.

### En `src`

- `deploy.bat` / `deploy.sh`: scripts de despliegue alternativos.
- `deploy-completo.bat` / `deploy-completo.sh`: despliegue + checks + init admin.
- `verificar-logs.bat` / `verificar-logs.sh`: validaciones para modulo de auditoria.

## Troubleshooting

### 1) Error en Logs de Auditoria: tabla no existe

Ejecuta `src/supabase/migration-logs-auditoria.sql` en Supabase SQL Editor.

### 2) Login funciona pero no hay datos

Verifica que ejecutaste `src/supabase/setup.sql` en el proyecto correcto.

### 3) Frontend apunta a otro backend

Revisa estos archivos:

- `src/utils/supabase/info.tsx`
- `src/utils/api.tsx`

Debe coincidir project id, anon key y nombre de function (`make-server-bebfd31a`).

### 4) Error al desplegar con scripts

- Asegurate de ejecutarlos dentro de `src`.
- Verifica version de Supabase CLI.
- Si hay conflicto de nombre de funcion, deploya manualmente la funcion correcta.

## Notas de seguridad y produccion

- Las credenciales por defecto deben cambiarse inmediatamente.
- No dejes scripts de inicializacion y credenciales hardcodeadas en entornos productivos.
- Revisa y endurece politicas RLS para produccion.
- Implementa rotacion de claves y gestion segura de secretos.

---

