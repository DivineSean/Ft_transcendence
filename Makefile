PROFILE ?= dev
COMPOSE_FILE = docker-compose.yml

BASE_DIR := .
ELK_DIR := elk
MONITORING_DIR := monitoring

all: check_env_files up_base

check_env_files:
	@for dir in $(BASE_DIR) $(ELK_DIR) $(MONITORING_DIR); do \
		if [ ! -f $$dir/.env ]; then \
			echo "Creating .env file in $$dir from .env.example"; \
			cp $$dir/.env.example $$dir/.env; \
		else \
			echo ".env file already exists in $$dir"; \
		fi \
	done

build_base:
	@echo "Building services in $(BASE_DIR) with profile: $(PROFILE)"
	docker-compose -f $(BASE_DIR)/$(COMPOSE_FILE) --profile $(PROFILE) build

up_base:
	@echo "Starting services in $(BASE_DIR) with profile: $(PROFILE)"
	docker-compose -f $(BASE_DIR)/$(COMPOSE_FILE) --profile $(PROFILE) up -d

build_elk:
	@echo "Building services in $(ELK_DIR)"
	docker-compose -f $(ELK_DIR)/$(COMPOSE_FILE) build

up_elk:
	@echo "Starting services in $(ELK_DIR)"
	docker-compose -f $(ELK_DIR)/$(COMPOSE_FILE) up -d

logs_elk:
	@echo "Tailing logs for ELK services."
	docker-compose -f $(ELK_DIR)/$(COMPOSE_FILE) logs -f

build_monitoring:
	@echo "Building services in $(MONITORING_DIR)"
	docker-compose -f $(MONITORING_DIR)/$(COMPOSE_FILE) build

up_monitoring:
	@echo "Starting services in $(MONITORING_DIR)"
	docker-compose -f $(MONITORING_DIR)/$(COMPOSE_FILE) up -d

logs_monitoring:
	@echo "Tailing logs for monitoring services."
	docker-compose -f $(MONITORING_DIR)/$(COMPOSE_FILE) logs -f

build_all: build_base build_elk build_monitoring
	@echo "All services have been built."

up_all: up_base up_elk up_monitoring
	@echo "All services have been started."

logs:
	@echo "Tailing logs for profile: $(PROFILE)"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) logs -f $(filter-out $@,$(MAKECMDGOALS))

logs_all:
	@echo "Tailing logs for all services."
	@$(MAKE) logs -C $(BASE_DIR)
	@$(MAKE) logs_elk
	@$(MAKE) logs_monitoring

down_base:
	@echo "Stopping services in $(BASE_DIR)"
	docker-compose -f $(BASE_DIR)/$(COMPOSE_FILE) --profile $(PROFILE) down

down_elk:
	@echo "Stopping services in $(ELK_DIR)"
	docker-compose -f $(ELK_DIR)/$(COMPOSE_FILE) down

down_monitoring:
	@echo "Stopping services in $(MONITORING_DIR)"
	docker-compose -f $(MONITORING_DIR)/$(COMPOSE_FILE) down

down_all: down_base down_elk down_monitoring
	@echo "All services have been stopped."

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

re: clean up_base

prune: fclean
	@echo "Pruning all Docker data"
	docker system prune -a --volumes -f

rebuild:
	@echo "Rebuilding specific service: $(filter-out $@,$(MAKECMDGOALS))"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) build $(filter-out $@,$(MAKECMDGOALS))

shell:
	@echo "Running interactive shell for service: $(filter-out $@,$(MAKECMDGOALS))"
	docker-compose -f $(COMPOSE_FILE) --profile $(PROFILE) exec $(filter-out $@,$(MAKECMDGOALS)) sh

.PHONY: all check_env_files build_base build_elk build_monitoring \
	build_all up_base up_elk up_monitoring up_all down_base down_elk \
	down_monitoring down_all clean fckean re prune logs_elk logs_monitoring logs_all \
	rebuild shell
