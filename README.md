# SGB Library Management System

Sistema web para gestion de biblioteca con roles de administrador y cliente. El frontend esta construido con React, TypeScript y Vite; el backend usa Supabase Edge Functions y Supabase como servicio de autenticacion y datos.

## Funciones principales

- Catalogo publico de libros.
- Registro e inicio de sesion.
- Panel de administrador para gestionar libros, categorias, usuarios, prestamos y multas.
- Panel de cliente para consultar catalogo, prestamos propios y multas propias.
- Reportes, estadisticas y logs de auditoria para acciones relevantes.
- Borrado logico y rehabilitacion de registros principales.

## Arquitectura

- Frontend: React 18, TypeScript y Vite.
- UI: Radix UI, lucide-react y componentes propios.
- Backend: Supabase Edge Functions.
- Autenticacion: Supabase Auth.
- Datos: Supabase/PostgreSQL.
- Build y desarrollo: npm.

## Estructura del proyecto

```text
.
|- src/
|  |- components/
|  |  |- admin/        # vistas de administracion
|  |  |- auth/         # login y registro
|  |  |- cliente/      # vistas del cliente
|  |  |- public/       # catalogo publico
|  |- context/         # contexto de autenticacion
|  |- hooks/           # hooks reutilizables
|  |- utils/           # cliente API, auditoria y configuracion Supabase
|  |- supabase/
|     |- setup.sql
|     |- migration-logs-auditoria.sql
|     |- functions/
|- package.json
|- vite.config.ts
|- vercel.json
```

## Requisitos

- Node.js 18 o superior.
- npm.
- Proyecto Supabase configurado para autenticacion, base de datos y Edge Functions.
- Supabase CLI si vas a desplegar funciones desde local.

## Instalacion y ejecucion local

Instala dependencias:

```bash
npm install
```

Ejecuta el frontend en desarrollo:

```bash
npm run dev
```

Genera el build de produccion:

```bash
npm run build
```

Previsualiza el build localmente:

```bash
npm run start
```

Ejecuta la funcion backend en modo local:

```bash
npm run functions:local
```

## Configuracion

El proyecto debe configurarse con variables de entorno. No subir valores reales de claves, tokens, project refs, URLs privadas o credenciales al repositorio.


## Base de datos

Para una instalacion nueva, ejecuta los scripts SQL desde el SQL Editor de Supabase

