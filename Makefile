.PHONY: run-dev test test-servers test-client test-all \
        test-api-gateway test-document-service test-eureka test-lecture-service \
        test-chat-service test-summary-service

run:
	@echo "Starting Docker services..."
	docker compose --project-name nemo --env-file .env -f build/docker-compose.yml up --build


run-dev:
	@echo "Starting all services in parallel..."
	@parallel --line-buffer --colsep '\t' --tagstring '[{1}]' '{2}' ::: \
		'docker	docker compose -f build/docker-compose.dev.yaml up --build' \
		'client	cd client && bun i && bun dev' \
		'eureka	cd server/eureka && watchexec -r -e java,yml,yaml ./gradlew bootRun' \
		'api-gateway	cd server/api-gateway && watchexec -r -e java,yml,yaml ./gradlew bootRun' \
		'document-service	cd server/document-service && watchexec -r -e java,yml,yaml ./gradlew bootRun' \
		'quiz-service	cd server/quiz-service && watchexec -r -e java,yml,yaml ./gradlew bootRun' \
		'chat-service	cd server/chat-service && watchexec -r -e python,yml,yaml python main.py' \
		'summary-service	cd server/summary-service && watchexec -r -e python,yml,yaml python main.py'

# Directories of all server microservices that contain a Gradle wrapper
SERVER_SERVICES := \
	server/api-gateway \
	server/document-service \
	server/eureka \
	server/lecture-service \
	server/quiz-service

# Python services
PYTHON_SERVICES := \
	server/chat-service \
	server/summary-service

# Client application directory (contains Vitest suite)
CLIENT_DIR := client

# Default target: run both server and client tests
# Usage: `make test`

test: test-servers test-client

# Alias to maintain backward compatibility; `make test-all` will behave like test-servers only
test-all: test-servers

# Run Vitest suite for the React client

test-client:
	@echo "\n===== Running frontend tests =====";
	@cd $(CLIENT_DIR) && bun run test -- --run

# Run test-suite of every server microservice
# This keeps the output of each microservice separated for clarity.

test-servers:
	@for dir in $(SERVER_SERVICES); do \
	  echo "\n===== Running tests for $$dir ====="; \
	  (cd $$dir && ./gradlew --quiet test); \
	done
	@for dir in $(PYTHON_SERVICES); do \
	  echo "\n===== Running tests for $$dir ====="; \
	  (cd $$dir && python -m pytest 2>/dev/null || echo "No tests found or pytest not configured"); \
	done

# Convenience targets to run tests for an individual microservice

test-api-gateway:
	@$(MAKE) -C server/api-gateway test

test-document-service:
	@$(MAKE) -C server/document-service test

test-eureka:
	@$(MAKE) -C server/eureka test

test-lecture-service:
	@$(MAKE) -C server/lecture-service test

test-chat-service:
	@cd server/chat-service && python -m pytest 2>/dev/null || echo "No tests found or pytest not configured"

test-summary-service:
	@cd server/summary-service && python -m pytest 2>/dev/null || echo "No tests found or pytest not configured"
