#!/bin/sh

# Get to project root
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "$SCRIPT_DIR/.." || exit 1


build_and_push() {
    docker buildx build \
        --platform linux/amd64 \
        --push \
        --tag "ghcr.io/aet-devops25/team-sigma/$1:latest" \
        --file "$2/Dockerfile" \
        "$2"
}


build_and_push "client" "client" &
build_and_push "api-gateway" "server/api-gateway" &
build_and_push "chat-service" "server/chat-service" &
build_and_push "document-service" "server/document-service" &
build_and_push "genai-service" "server/genai-service" &
build_and_push "lecture-service" "server/lecture-service" &
build_and_push "quiz-service" "server/quiz-service" &
build_and_push "summary-service" "server/summary-service" &

wait
echo "️✅ Build and push docker images"

cd infra/helm/team-sigma || exit 1
make upgrade-prod || exit 1
make reload-prod || exit 1

echo "️✅ Upgrade and reload prod"
