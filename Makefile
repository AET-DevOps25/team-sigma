.PHONY: run-dev test test-all test-api-gateway test-document-service test-eureka test-hello-service

run-dev:
	docker compose up --build

# Directories of all server microservices that contain a Gradle wrapper
SERVER_SERVICES := \
	server/api-gateway \
	server/document-service \
	server/eureka \
	server/hello-service

# Default target to run the test-suite of every microservice
# Usage: `make test`

test: test-all

# Iterate over every service directory and execute its Gradle test task
# This keeps the output of each microservice separated for clarity.

test-all:
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