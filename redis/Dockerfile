FROM redis:7-alpine
RUN	apk add --no-cache gettext
COPY	./redis/redis.conf /usr/local/etc/redis/template.conf
COPY	./certs/server.pem /usr/local/etc/certs/server.pem
COPY	./certs/server-key.pem /usr/local/etc/certs/server-key.pem
COPY	./redis/entrypoint.sh /home/redis/entrypoint.sh
RUN	chmod +x /home/redis/entrypoint.sh
ENTRYPOINT ["sh", "/home/redis/entrypoint.sh"]
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
