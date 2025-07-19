FROM nginx:mainline-alpine-slim

# Install gettext package which provides envsubst
RUN apk add --no-cache gettext

# Copy the nginx configuration template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Create a startup script that will extract DNS server and generate config
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'export DNS_SERVER=$(cat /etc/resolv.conf |grep -i "^nameserver"|head -n1|cut -d " " -f2)' >> /docker-entrypoint.sh && \
    echo 'envsubst "\${DNS_SERVER}" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Use the startup script as entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
