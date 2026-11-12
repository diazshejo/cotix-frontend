FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" && npm run build && node scripts/generate-nginx-config.mjs

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.generated.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
