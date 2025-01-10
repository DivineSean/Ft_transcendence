FROM		node:19-alpine AS dev

RUN			mkdir -p /home/app
RUN			mkdir -p /home/certs
RUN			addgroup -S app && adduser -S -G app app

WORKDIR		/home/app/

RUN			chown -R app:app /home/app
USER		app

COPY		./frontend/package.json .
RUN			npm install

COPY		certs/server-key.pem /home/certs
COPY		certs/server.pem /home/certs

COPY		./frontend .

EXPOSE		8080

ENV			NODE_ENV=development

ENTRYPOINT	["npm", "run", "dev"]

########### Prod #############
FROM	node:19-alpine AS prod

RUN		mkdir -p /home/app

WORKDIR	/home/app/

COPY	./frontend/package.json .
RUN		npm install

COPY	./frontend .

ENV		NODE_ENV=production

ENTRYPOINT	["npm", "run", "build"]
