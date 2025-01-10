PROFILE ?= dev
COMPOSE_FILE = docker-compose.yml

LOG_FILES_DYNAMIC = $(addprefix $(LOG_DIR)/, $(LOG_FILES))
LOG_DIR = logs
LOG_FILES = nginx_access.log \
			nginx_errors.log \
			uvicorn.log

all: up

up: build
	@echo "Starting services with profile: $(PROFILE)"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) up -d

down:
	@echo "Stopping services with profile: $(PROFILE)"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) down

stop:
	@echo "Stopping containers"
	docker-compose -f $(COMPOSE_FILE) stop

start:
	@echo "Starting stopped containers"
	docker-compose -f $(COMPOSE_FILE) start

build: $(LOG_FILES_DYNAMIC)
	clear
	@echo "Building containers with profile: $(PROFILE)"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) build

clean: stop
	@echo "Cleaning containers, networks, and volumes"
	docker stop $$(docker ps -qa) || true
	sleep 1
	docker rm $$(docker ps -qa) || true
	docker volume rm $$(docker volume ls -q) || true
	docker network rm $$(docker network ls -q) || true

fclean: clean
	@echo "Removing all images"
	docker rmi -f $$(docker images -qa) || true

re: clean up

prune: fclean
	@echo "Pruning all Docker data"
	docker system prune -a --volumes -f

logs:
	@echo "Tailing logs for profile: $(PROFILE)"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) logs -f $(filter-out $@,$(MAKECMDGOALS))

rebuild:
	@echo "Rebuilding specific service: $(filter-out $@,$(MAKECMDGOALS))"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) build $(filter-out $@,$(MAKECMDGOALS))

shell:
	@echo "Running interactive shell for service: $(filter-out $@,$(MAKECMDGOALS))"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) exec $(filter-out $@,$(MAKECMDGOALS)) sh

$(LOG_FILES_DYNAMIC): $(LOG_DIR)/%:
	mkdir -p $(LOG_DIR)
	touch $@

.PHONY: all up down stop start build clean re prune logs rebuild shell
