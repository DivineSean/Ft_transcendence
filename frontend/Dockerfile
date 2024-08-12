FROM	node:19-alpine

RUN		mkdir -p /home/app
RUN		addgroup -S app && adduser -S -G app app

WORKDIR	/home/app/

RUN		chown -R app:app /home/app
USER	app

COPY	package.json .
RUN		npm install

COPY	. .

EXPOSE 8080

ENTRYPOINT ["npm", "run", "dev"]
