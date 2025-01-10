FROM	nginx:1.27.1-alpine-slim AS dev
COPY	./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY	./certs/server.pem /etc/certs/server.pem
COPY	./certs/server-key.pem /etc/certs/server-key.pem

################### Prod ###############
FROM	nginx:1.27.1-alpine-slim AS prod
COPY	./nginx/prod.conf /etc/nginx/conf.d/default.conf
COPY	./certs/server.pem /etc/certs/server.pem
COPY	./certs/server-key.pem /etc/certs/server-key.pem
