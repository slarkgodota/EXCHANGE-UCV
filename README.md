# Exchange UCV

Aplicación académica colaborativa desarrollada con React, TypeScript y Vite.

## Configurar inicio de sesión

```bash
npm install --legacy-peer-deps
```

1. Crea un proyecto en Supabase y habilita **Authentication → Providers → Email**.
2. Copia `.env.example` a `.env.local` y define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL del proyecto y su clave pública (publishable/anon).
3. En **Authentication → URL Configuration**, añade `http://localhost:3000` y `https://slarkgodota.github.io/EXCHANGE-UCV/` como URLs de redirección permitidas.
4. Nunca uses ni publiques la clave `service_role`.
5. Para crear las tablas, abre **SQL Editor**, pega y ejecuta el contenido de [`supabase/migrations/20261103000000_initial_schema.sql`](./supabase/migrations/20261103000000_initial_schema.sql).

## Desarrollo local

```bash
npm run dev
```

Supabase gestiona el registro, la confirmación de correo y el inicio/cierre de sesión. El resto de los datos de la aplicación continúa guardándose localmente en el navegador; todavía no se sincroniza entre usuarios o dispositivos.

## GitHub Pages

```bash
npm run build:pages
```

El comando genera el sitio estático en `dist/`. GitHub Pages no ejecuta el servidor Express. Configura las dos variables de Supabase en el entorno antes de generar la versión que se publica. No subas `.env.local` ni datos personales.
