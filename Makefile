.PHONY: run-dev test test-servers test-client test-all \
        test-api-gateway test-document-service test-eureka test-hello-service

run-dev:
	docker compose up --build

# Directories of all server microservices that contain a Gradle wrapper
SERVER_SERVICES := \
	server/api-gateway \
	server/document-service \
	server/eureka \
	server/hello-service

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

# Convenience targets to run tests for an individual microservice

test-api-gateway:
	@$(MAKE) -C server/api-gateway test

test-document-service:
	@$(MAKE) -C server/document-service test

test-eureka:
	@$(MAKE) -C server/eureka test

test-hello-service:
	@$(MAKE) -C server/hello-service test