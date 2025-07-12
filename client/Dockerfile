FROM oven/bun:1.2-alpine AS builder
WORKDIR /app
COPY ./package.json ./bun.lock ./
RUN bun i --frozen-lockfile
COPY ./.env ./eslint.config.js ./index.html ./tsconfig.* ./vite.config.ts ./
COPY ./public/ ./public/
COPY ./src/ ./src/
RUN bun run build

FROM nginx:mainline-alpine-slim
COPY ./nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# Set default API Gateway URL if not provided
ENV API_GATEWAY_URL=http://localhost:8080
