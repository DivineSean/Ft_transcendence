#!/bin/sh

envsubst </etc/alertmanager/alertmanager.yml.template >/etc/alertmanager/alertmanager.yml

/usr/local/bin/alertmanager \
	--config.file=/etc/alertmanager/alertmanager.yml \
	--storage.path=/var/lib/alertmanager \
	--web.listen-address=:9093 \
	--web.config.file=/etc/alertmanager/web-config.yml &

exec $@
