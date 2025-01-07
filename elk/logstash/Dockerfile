FROM	docker.elastic.co/logstash/logstash:8.17.0

USER	root
COPY	./logstash.conf /usr/share/logstash/pipeline/logstash.conf
COPY	./logstash.yml /usr/share/logstash/config/logstash.yml
