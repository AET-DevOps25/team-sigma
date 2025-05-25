#!/bin/bash

# Team Sigma Helm Deployment Script
# Usage: ./deploy.sh [env] [release-name]
# env: dev, prod, or default
# release-name: optional, defaults to "team-sigma"

set -e

ENV=${1:-default}
RELEASE_NAME=${2:-team-sigma}
CHART_PATH="."
NAMESPACE="team-sigma"

echo "🚀 Deploying Team Sigma with Helm..."
echo "Environment: $ENV"
echo "Release Name: $RELEASE_NAME"
echo "Chart Path: $CHART_PATH"

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install Helm first."
    exit 1
fi

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl is not configured or cluster is not accessible."
    exit 1
fi

# Create namespace if it doesn't exist
echo "📦 Creating namespace if it doesn't exist..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy based on environment
case $ENV in
    "dev")
        echo "🔧 Deploying to development environment..."
        helm upgrade --install $RELEASE_NAME $CHART_PATH \
            -f ./values-dev.yaml \
            --namespace $NAMESPACE \
            --wait
        ;;
    "prod")
        echo "🏭 Deploying to production environment..."
        helm upgrade --install $RELEASE_NAME $CHART_PATH \
            -f ./values-prod.yaml \
            --namespace $NAMESPACE \
            --wait
        ;;
    "default")
        echo "⚙️  Deploying with default configuration..."
        helm upgrade --install $RELEASE_NAME $CHART_PATH \
            --namespace $NAMESPACE \
            --wait
        ;;
    *)
        echo "❌ Unknown environment: $ENV"
        echo "Valid options: dev, prod, default"
        exit 1
        ;;
esac

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Release Information:"
helm list -n $NAMESPACE

echo ""
echo "🔍 Pod Status:"
kubectl get pods -n $NAMESPACE

echo ""
echo "🌐 Services:"
kubectl get svc -n $NAMESPACE

if [ "$ENV" = "dev" ]; then
    echo ""
    echo "🔗 NodePort Services (Development Access):"
    echo "- Client: http://localhost:30000"
    echo "- API Gateway: http://localhost:30080"
    echo "- Eureka: http://localhost:30761"
fi

echo ""
echo "📝 To view the full deployment notes:"
echo "helm get notes $RELEASE_NAME -n $NAMESPACE" 