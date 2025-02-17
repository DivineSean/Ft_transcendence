PROFILE ?= dev
COMPOSE_FILE = docker-compose.yml

BASE_DIR := .
ELK_DIR := elk
MONITORING_DIR := monitoring

BASE_ENV := $(BASE_DIR)/.env
ELK_ENV := $(ELK_DIR)/.env
MONITORING_ENV := $(MONITORING_DIR)/.env

all: $(BASE_ENV) $(ELK_ENV) $(MONITORING_ENV) up

$(BASE_ENV): $(BASE_DIR)/.env.example
	@if [ ! -f $@ ]; then \
		echo "Creating .env file in $(BASE_DIR) from .env.example"; \
		cp $< $@; \
	else \
		echo ".env file already exists in $(BASE_DIR)"; \
	fi

$(ELK_ENV): $(ELK_DIR)/.env.example
	@if [ ! -f $@ ]; then \
		echo "Creating .env file in $(ELK_DIR) from .env.example"; \
		cp $< $@; \
	else \
		echo ".env file already exists in $(ELK_DIR)"; \
	fi

$(MONITORING_ENV): $(MONITORING_DIR)/.env.example
	@if [ ! -f $@ ]; then \
		echo "Creating .env file in $(MONITORING_DIR) from .env.example"; \
		cp $< $@; \
	else \
		echo ".env file already exists in $(MONITORING_DIR)"; \
	fi

build: $(BASE_ENV)
	@echo "Building services in $(BASE_DIR) with profile: $(PROFILE)"
	docker-compose -f $(BASE_DIR)/$(COMPOSE_FILE) --profile $(PROFILE) build

up: build
	@echo "Starting services in $(BASE_DIR) with profile: $(PROFILE)"
	docker-compose -f $(BASE_DIR)/$(COMPOSE_FILE) --profile $(PROFILE) up -d

build_elk: $(ELK_ENV)
	@echo "Building services in $(ELK_DIR)"
	docker-compose -f $(ELK_DIR)/$(COMPOSE_FILE) build

up_elk: build_elk
	@echo "Starting services in $(ELK_DIR)"
	docker-compose -f $(ELK_DIR)/$(COMPOSE_FILE) up -d

logs_elk:
	@echo "Tailing logs for ELK services."
	docker-compose -f $(ELK_DIR)/$(COMPOSE_FILE) logs -f

build_monitoring: $(MONITORING_ENV)
	@echo "Building services in $(MONITORING_DIR)"
	docker-compose -f $(MONITORING_DIR)/$(COMPOSE_FILE) build

up_monitoring: build_monitoring
	@echo "Starting services in $(MONITORING_DIR)"
	docker-compose -f $(MONITORING_DIR)/$(COMPOSE_FILE) up -d

logs_monitoring:
	@echo "Tailing logs for monitoring services."
	docker-compose -f $(MONITORING_DIR)/$(COMPOSE_FILE) logs -f

build_all: build build_elk build_monitoring
	@echo "All services have been built."

up_all: up up_elk up_monitoring
	@echo "All services have been started."

logs:
	@echo "Tailing logs for profile: $(PROFILE)"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) logs -f $(filter-out $@,$(MAKECMDGOALS))

logs_all:
	@echo "Tailing logs for all services."
	@$(MAKE) logs -C $(BASE_DIR)
	@$(MAKE) logs_elk
	@$(MAKE) logs_monitoring

down:
	@echo "Stopping services in $(BASE_DIR)"
	docker-compose -f $(BASE_DIR)/$(COMPOSE_FILE) --profile $(PROFILE) down

down_elk:
	@echo "Stopping services in $(ELK_DIR)"
	docker-compose -f $(ELK_DIR)/$(COMPOSE_FILE) down

down_monitoring:
	@echo "Stopping services in $(MONITORING_DIR)"
	docker-compose -f $(MONITORING_DIR)/$(COMPOSE_FILE) down

down_all: down down_elk down_monitoring
	@echo "All services have been stopped."

restart:
	@echo "restarting: $(filter-out $@,$(MAKECMDGOALS))"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) restart $(filter-out $@,$(MAKECMDGOALS))

clean: down_all
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

rebuild:
	@echo "Rebuilding specific service: $(filter-out $@,$(MAKECMDGOALS))"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) build $(filter-out $@,$(MAKECMDGOALS))

shell:
	@echo "Running interactive shell for service: $(filter-out $@,$(MAKECMDGOALS))"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) exec $(filter-out $@,$(MAKECMDGOALS)) sh

.PHONY: all build up build_elk up_elk logs_elk \
        build_monitoring up_monitoring logs_monitoring build_all up_all logs \
        logs_all down down_elk down_monitoring down_all restart clean fclean re \
        prune rebuild shell
