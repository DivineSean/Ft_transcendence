FROM		alpine:3.20

RUN			apk add --no-cache openssl

WORKDIR	/config

COPY		generate_certs.sh .

RUN			chmod +x generate_certs.sh

ENTRYPOINT ["/config/generate_certs.sh"]
