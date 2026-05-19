Instrucciones para funciones (local y despliegue)

Requisitos:
- Node 18+
- Variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

Ejecutar frontend en local:
```bash
npm install
npm run dev
```

Ejecutar funciones localmente:
```bash
# instalar dependencias si no lo hiciste
npm install
# arrancar servidor local de funciones
npm run functions:local
```

Despliegue en Vercel:
- Vercel usa funciones serverless Node. Las rutas de funciones están en `src/supabase/functions/make-server-bebfd31a`.
- Puedes crear un endpoint en Vercel que importe `server.local.ts` o empaquetar los handlers como funciones individuales.
- Alternativa rápida: desplegar solo frontend a Vercel y usar Supabase Edge Functions directamente para el backend.

Notas:
- No se eliminaron los archivos de diagramas.
- `tsconfig.json` excluye `src/supabase/functions` para evitar errores de TypeScript con imports Deno.
