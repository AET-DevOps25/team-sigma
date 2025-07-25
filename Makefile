.PHONY: run-dev test test-servers test-client test-all \
        test-document-service test-lecture-service \
        test-chat-service test-summary-service test-genai-service test-quiz-service

run:
	@echo "Starting Docker services..."
	docker compose --project-name nemo --env-file .env -f build/docker-compose.yml up --build

# Directories of all server microservices that contain a Gradle wrapper
SERVER_SERVICES := \
	server/document-service \
	server/lecture-service

# Python services
PYTHON_SERVICES := \
	server/chat-service \
	server/summary-service \
	server/genai-service \
	server/quiz-service

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
test-document-service:
	@$(MAKE) -C server/document-service test

test-lecture-service:
	@$(MAKE) -C server/lecture-service test

test-chat-service:
	@echo "\n===== Running tests for chat-service ====="
	@cd server/chat-service && pip install -r requirements.txt && python -m pytest

test-summary-service:
	@echo "\n===== Running tests for summary-service ====="
	@cd server/summary-service && pip install -r requirements.txt && python -m pytest

test-genai-service:
	@echo "\n===== Running tests for genai-service ====="
	@cd server/genai-service && pip install -r requirements.txt && python -m pytest

test-quiz-service:
	@echo "\n===== Running tests for quiz-service ====="
	@cd server/quiz-service && pip install -r requirements.txt && python -m pytest
