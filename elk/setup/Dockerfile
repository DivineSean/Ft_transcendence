FROM	docker.elastic.co/elasticsearch/elasticsearch:8.17.0
COPY	./setup.sh /usr/share/elasticsearch/setup.sh
COPY	./kibana_config.ndjson /usr/share/elasticsearch/config/kibana_config.ndjson
USER	root
RUN		chmod +x /usr/share/elasticsearch/setup.sh
CMD		["bash", "/usr/share/elasticsearch/setup.sh"]
