#!/usr/bin/env python3
"""
Script para corregir las rutas del servidor Edge Function
Quita el prefijo '/make-server-bebfd31a/' de todas las rutas
"""

import re

# Leer el archivo
with open('supabase/functions/server/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reemplazar todas las ocurrencias
content_fixed = re.sub(
    r"app\.(get|post|put|delete)\('/make-server-bebfd31a/",
    r"app.\1('/",
    content
)

# Escribir el archivo corregido
with open('supabase/functions/server/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print("✅ Rutas corregidas exitosamente")
print("📝 Total de reemplazos realizados:", content.count("'/make-server-bebfd31a/"))
print("\n🔄 Próximo paso: Redesplegar el servidor")
print("   supabase functions deploy server")