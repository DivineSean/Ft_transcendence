#!/bin/sh

# Generate CA
openssl genpkey --algorithm RSA -out certs/ca.key
openssl req -x509 -new -nodes -key certs/ca.key -sha256 -days 1337 -out certs/ca.crt -subj "/C=MA/ST=Khouribga/L=KH/O=1337/OU=42/CN=localhost"

# Generate server certificate and key
openssl genpkey --algorithm RSA -out certs/server-key.pem
openssl req -new -key certs/server-key.pem -out certs/server.csr -subj "/C=MA/ST=Khouribga/L=KH/O=1337/OU=42/CN=localhost"
openssl x509 -req -in certs/server.csr -CA certs/ca.crt -CAkey certs/ca.key -CAcreateserial -out certs/server.pem -days 1337 -sha256

# Remove leftovers
rm certs/ca.key certs/ca.crt certs/ca.srl certs/server.csr certs/server.key certs/server.crt
