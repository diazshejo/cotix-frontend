# Cotix frontend

Aplicación React + Vite. Requiere la API de `cotix-backend` y PostgreSQL.

Para levantar el sistema completo desde clones limpios, coloca `cotix-frontend` junto a `cotix-backend` y sigue las [instrucciones de arranque local del backend](https://github.com/diazshejo/cotix-backend/blob/main/README.md). Copia `.env.example` a `.env` antes de iniciar; `VITE_API_URL` apunta a `http://localhost:8000/api` para que las cookies de sesión usen el mismo host que el frontend.

Sin Docker, instala dependencias con `npm ci` y ejecuta `npm run dev` después de arrancar el backend. Verifica con `npm test` y `npm run build`.

La imagen de producción requiere la URL HTTPS de la API al compilar. Con ella genera una CSP que solo permite conexiones a ese origen:

```bash
docker build --build-arg VITE_API_URL=https://api.tudominio.com/api -t cotix-frontend .
```

Las sesiones usan cookies `HttpOnly` y CSRF; el frontend no almacena JWT. Publica frontend y API sobre HTTPS y configura en el backend el origen exacto del frontend en `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS`.
