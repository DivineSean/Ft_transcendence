FROM postgres:16-alpine

RUN		mkdir -p /var/lib/postgresql/certs
COPY		certs/server-key.pem /var/lib/postgresql/certs
COPY		certs/server.pem /var/lib/postgresql/certs
RUN chown -R postgres:postgres /var/lib/postgresql/certs && \
    chmod 600 /var/lib/postgresql/certs/server-key.pem
USER	postgres

CMD ["-c", "ssl=on", "-c", "ssl_cert_file=/var/lib/postgresql/certs/server.pem", "-c", "ssl_key_file=/var/lib/postgresql/certs/server-key.pem"]
