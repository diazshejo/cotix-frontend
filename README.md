# Cotix frontend

Aplicación React + Vite. Requiere la API de `cotix-backend` y PostgreSQL.

Para levantar el sistema completo desde clones limpios, coloca `cotix-frontend` junto a `cotix-backend` y sigue las [instrucciones de arranque local del backend](https://github.com/diazshejo/cotix-backend/blob/main/README.md). Copia `.env.example` a `.env` antes de iniciar; `VITE_API_URL` apunta a `http://127.0.0.1:8000/api`.

Sin Docker, instala dependencias con `npm ci` y ejecuta `npm run dev` después de arrancar el backend. Verifica con `npm test` y `npm run build`.
