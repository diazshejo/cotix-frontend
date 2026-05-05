# Cotix Frontend

Frontend SPA para Cotix, cotizador digital SaaS. Esta base esta preparada para MVP comercial con autenticacion, roles, rutas protegidas, portal publico y contratos listos para Django REST Framework.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- TanStack Query
- Zustand
- React Hook Form + Zod
- Axios
- Recharts
- Sonner
- Lucide React
- Vitest

## Estructura

```txt
src/
  api/                 cliente Axios, servicios por modulo y API_CONTRACTS.md
  components/          UI, layout, estados, confirmaciones
  constants/           rutas y query keys
  data/                mocks fallback temporal
  features/            auth, dashboard, quotes, clients, catalog, reports, settings, public, marketing
  hooks/               hooks reutilizables
  stores/              Zustand stores
  types/               modelos UI
  utils/               permisos, validadores, currency, calculos, session sync
```

## Comandos

```bash
npm install
npm run dev
npm run test
npm run build
npm run preview
```

## Variables de entorno

```ini
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_URL=http://localhost:5173
VITE_USE_MOCKS=false
```

`VITE_USE_MOCKS=false` fuerza a que los servicios consuman el backend Django real y fallen si la API no responde. Con mocks habilitados, algunos servicios usan fallback temporal solo ante errores de red.

## Rutas principales

- `/` landing comercial publica.
- `/login` ingreso.
- `/registro` onboarding.
- `/recuperar-password` recuperacion.
- `/app/dashboard` dashboard interno.
- `/app/quotes` listado de cotizaciones.
- `/app/quotes/new` constructor.
- `/app/clients` clientes.
- `/app/catalog/items` catalogo.
- `/app/reports` reportes.
- `/app/settings/company` configuracion de empresa.
- `/q/:token` portal publico de cliente.

## Roles y permisos

Roles soportados:

- `tenant_admin`: acceso completo.
- `seller`: cotizaciones, constructor, clientes, catalogo y reportes. Sin settings.
- `viewer`: lectura de dashboard, cotizaciones, clientes, catalogo y reportes. Sin constructor ni acciones de escritura.

Helpers:

- `canAccess(role, resource)`
- `canPerform(role, action)`

La navegacion se oculta segun rol y `ProtectedRoute` bloquea acceso directo a recursos no permitidos.

## Auth

El access token vive solo en memoria. Django guarda el refresh token en una cookie `HttpOnly`; el frontend no lee ni guarda refresh tokens en `localStorage`.

Flujo:

1. Login llama `POST /auth/login/`.
2. Login recibe solo el access token y luego llama `GET /auth/me/`.
3. Bootstrap llama `POST /auth/refresh/` con cookies y luego `GET /auth/me/`.
4. Logout llama `POST /auth/logout/` y el backend limpia la cookie.
5. Sesion vencida limpia estado y muestra mensaje.
6. Login/logout/sesion vencida se sincronizan entre pestanas con `BroadcastChannel` y fallback `storage`.

## Backend

Los contratos esperados estan documentados en:

```txt
src/api/API_CONTRACTS.md
```

Los servicios separan:

- DTO recibido del backend.
- Modelo usado por UI.
- Payload enviado al backend.

## UX MVP

- Landing publica para demo comercial.
- Layout interno responsive con sidebar desktop y menu movil.
- Estados loading, error y empty.
- Confirmaciones profesionales para acciones sensibles.
- Tablas adaptadas a tarjetas en movil en pantallas clave.
- Acciones no disponibles se ocultan o deshabilitan segun rol.

## Pendientes reales

- Confirmar endpoints finales y serializers con Django.
- Implementar permisos tambien en backend.
- Sustituir fallbacks mock al activar backend real.
- Agregar pruebas E2E con backend o mocks de red.
- Completar busqueda global y notificaciones cuando existan endpoints.
