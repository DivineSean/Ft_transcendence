FROM		alpine:3.20

RUN			apk add --no-cache ca-certificates openssl gettext

COPY		--from=prom/prometheus:v2.54.1 /bin/prometheus /usr/local/bin/prometheus
COPY		--from=prom/alertmanager:v0.25.0 /bin/alertmanager /usr/local/bin/alertmanager

RUN			addgroup -S prometheus && adduser -S -G prometheus prometheus \
			&& mkdir -p /etc/prometheus /etc/alertmanager \
			/var/lib/prometheus /var/lib/alertmanager

RUN			openssl req -x509 -nodes -days 365 \
			-keyout /etc/prometheus/prometheus.key \
			-out /etc/prometheus/prometheus.crt \
			-subj "/C=MA/S=Khouribga/L=KH/O=1337/OU=42/CN=localhost/UID=prometheus" && \
			cp /etc/prometheus/prometheus.key /etc/alertmanager/alertmanager.key && \
			cp /etc/prometheus/prometheus.crt /etc/alertmanager/alertmanager.crt

RUN			chown -R prometheus:prometheus \
			/usr/local/bin/prometheus /usr/local/bin/alertmanager \
			/etc/prometheus /etc/alertmanager \
			/var/lib/prometheus /var/lib/alertmanager

COPY		./config/ /etc/prometheus/
COPY		./alert-config/ /etc/alertmanager/
COPY		entrypoint.sh /etc/prometheus/

RUN			chmod +x /etc/prometheus/entrypoint.sh
USER		prometheus

ENTRYPOINT	["/etc/prometheus/entrypoint.sh"]
CMD			["/usr/local/bin/prometheus", "--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/var/lib/prometheus", "--web.listen-address=:9090", "--storage.tsdb.retention.time=7d", "--web.config.file=/etc/prometheus/web-config.yml"]

