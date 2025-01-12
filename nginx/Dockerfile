FROM	nginx:1.27.1-alpine-slim AS dev
COPY	./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY	./certs/server.pem /etc/certs/server.pem
COPY	./certs/server-key.pem /etc/certs/server-key.pem

################### Prod ###############
FROM	nginx:1.27.1-alpine-slim AS prod

COPY	./nginx/nginx.conf /etc/nginx/nginx.conf
COPY	./nginx/prod.conf /etc/nginx/conf.d/default.conf
COPY	./certs/server.pem /etc/certs/server.pem
COPY	./certs/server-key.pem /etc/certs/server-key.pem

RUN		chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx
USER	nginx
