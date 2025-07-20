FROM oven/bun:1.2-alpine AS builder
WORKDIR /app
COPY ./package.json ./bun.lock ./
RUN bun i --frozen-lockfile
COPY ./.env ./eslint.config.js ./index.html ./tsconfig.* ./vite.config.ts ./
COPY ./public/ ./public/
COPY ./src/ ./src/
RUN bun run build

FROM nginx:mainline-alpine-slim

# Copy the built client
COPY --from=builder /app/dist /usr/share/nginx/html

# Install gettext package which provides envsubst
RUN apk add --no-cache gettext

# Copy the nginx configuration template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Create a startup script that will extract DNS server and search suffix, then generate config
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'export DNS_SERVER=$(cat /etc/resolv.conf |grep -i "^nameserver"|head -n1|cut -d " " -f2)' >> /docker-entrypoint.sh && \
    echo 'export SEARCH_SUFFIX=$(cat /etc/resolv.conf |grep -i "^search"|head -n1|cut -d " " -f2)' >> /docker-entrypoint.sh && \
    echo 'if [ -z "$SEARCH_SUFFIX" ]; then export SEARCH_SUFFIX=""; else export SEARCH_SUFFIX=."$SEARCH_SUFFIX"; fi' >> /docker-entrypoint.sh && \
    echo 'envsubst "\${DNS_SERVER} \${SEARCH_SUFFIX} \${API_GATEWAY_URL}" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Use the startup script as entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
