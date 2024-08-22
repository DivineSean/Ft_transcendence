FROM	node:19-alpine

RUN		mkdir -p /home/app
RUN		mkdir -p /home/certs
RUN		addgroup -S app && adduser -S -G app app

WORKDIR	/home/app/

RUN		chown -R app:app /home/app
USER	app

COPY	./frontend/package.json .
RUN		npm install

COPY		certs/server-key.pem /home/certs
COPY		certs/server.pem /home/certs

COPY	./frontend .

EXPOSE 8080

ENTRYPOINT ["npm", "run", "dev"]
