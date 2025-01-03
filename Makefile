all: up

up: build
	docker-compose -f docker-compose.yml up -d

app: build
	docker-compose -f docker-compose.yml up -d
	docker-compose -f elk/docker-compose.yml up -d

down:
	docker-compose -f docker-compose.yml down

stop:
	docker-compose -f docker-compose.yml stop

start:
	docker-compose -f docker-compose.yml start

build:
	clear
	docker-compose -f docker-compose.yml build
	docker-compose -f elk/docker-compose.yml build

clean: stop
	docker stop $$(docker ps -qa) || true
	sleep 1
	docker rm $$(docker ps -qa) || true
	docker volume rm $$(docker volume ls -q) || true
	docker network rm $$(docker network ls -q) || true

fclean: clean
	docker rmi -f $$(docker images -qa) || true

re: clean up

prune: fclean
	docker system prune -a --volumes -f

.PHONY: all up down stop start build clean re prune
