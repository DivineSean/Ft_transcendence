FROM	grafana/grafana

USER	root
RUN		apk add --no-cache openssl

RUN		mkdir -p /etc/grafana/ssl && \
		openssl req -x509 -nodes -days 365 \
		-keyout /etc/grafana/ssl/grafana.key \
		-out /etc/grafana/ssl/grafana.crt \
		-subj "/C=MA/S=Khouribga/L=KH/O=1337/OU=42/CN=grafana/UID=grafana"

COPY	./config/grafana.ini /etc/grafana/grafana.ini
COPY	./config/provisioning /etc/grafana/provisioning
COPY	./dashboards /etc/grafana/dashboards

RUN		chown -R grafana:root /etc/grafana
USER	grafana
