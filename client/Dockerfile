FROM oven/bun:1.2-alpine AS builder
WORKDIR /app
COPY ./package.json ./bun.lock ./
RUN bun i --frozen-lockfile
COPY ./.env ./eslint.config.js ./index.html ./tsconfig.* ./vite.config.ts ./
COPY ./public/ ./public/
COPY ./src/ ./src/
RUN bun run build

FROM nginx:mainline-alpine-slim
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
