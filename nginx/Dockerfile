FROM	nginx:1.27.1-alpine-slim AS dev

RUN		apk add --no-cache openssl
RUN		mkdir -p /etc/certs && \
		chown -R nginx:nginx /etc/certs && \
		openssl req -x509 -nodes -days 365 \
		-keyout /etc/certs/server-key.pem \
		-out /etc/certs/server.pem \
		-subj "/C=MA/S=Khouribga/L=KH/O=1337/OU=42" && \
		chmod 644 /etc/certs/server-key.pem /etc/certs/server.pem

COPY	./nginx/default.conf /etc/nginx/conf.d/default.conf

################### Prod ###############
FROM	nginx:1.27.1-alpine-slim AS prod

RUN		apk add --no-cache openssl
RUN		mkdir -p /etc/certs && \
		chown -R nginx:nginx /etc/certs && \
		openssl req -x509 -nodes -days 365 \
		-keyout /etc/certs/server-key.pem \
		-out /etc/certs/server.pem \
		-subj "/C=MA/S=Khouribga/L=KH/O=1337/OU=42" && \
		chmod 644 /etc/certs/server-key.pem /etc/certs/server.pem

COPY	./nginx/nginx.conf /etc/nginx/nginx.conf
COPY	./nginx/prod.conf /etc/nginx/conf.d/default.conf

RUN		chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx
USER	nginx
