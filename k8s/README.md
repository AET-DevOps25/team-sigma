# Team Sigma Kubernetes Configuration

This directory contains Kubernetes manifests that replicate the functionality of the Docker Compose setup for the Team Sigma microservices application.

## Architecture Overview

The application consists of:

- **Eureka**: Service discovery server (Spring Boot, Java 21)
- **API Gateway**: Gateway service (Spring Boot, Java 21)
- **Hello Service**: Example microservice (Spring Boot, Java 21)
- **Client**: Frontend application (Bun/Vite build served by Nginx)

## Files Description

| File                            | Description                                         |
| ------------------------------- | --------------------------------------------------- |
| `namespace.yaml`                | Creates the `team-sigma` namespace                  |
| `configmap.yaml`                | Centralized configuration for environment variables |
| `eureka-deployment.yaml`        | Eureka service discovery deployment and service     |
| `api-gateway-deployment.yaml`   | API Gateway deployment and service                  |
| `hello-service-deployment.yaml` | Hello Service deployment and service                |
| `client-deployment.yaml`        | Frontend client deployment and service              |
| `ingress.yaml`                  | Ingress and NodePort services for external access   |
| `kustomization.yaml`            | Kustomize configuration to manage all resources     |

## Docker Compose to Kubernetes Mapping

### Port Mappings

| Docker Compose            | Kubernetes NodePort | Kubernetes Ingress        |
| ------------------------- | ------------------- | ------------------------- |
| `3000:80` (client)        | `30000:80`          | `team-sigma.local/`       |
| `8080:8080` (api-gateway) | `30080:8080`        | `team-sigma.local/api`    |
| `8761:8761` (eureka)      | `30761:8761`        | `team-sigma.local/eureka` |

### Environment Variables

Environment variables from Docker Compose are preserved and managed through:

- Direct environment variables in deployments
- ConfigMap for shared configuration

### Network Isolation

- Docker Compose networks are replaced with Kubernetes Services
- Service discovery works through Kubernetes DNS (`service-name.namespace.svc.cluster.local`)

## Prerequisites

1. **Kubernetes Cluster**: Minikube, kind, or any Kubernetes cluster
2. **Kubectl**: Kubernetes CLI tool
3. **Docker Images**: Build and push the Docker images to a registry

## Building and Pushing Images

Before deploying, build and push the Docker images:

```bash
# Build images
docker build -t team-sigma/eureka:latest ./server/eureka
docker build -t team-sigma/api-gateway:latest ./server/api-gateway
docker build -t team-sigma/hello-service:latest ./server/hello-service
docker build -t team-sigma/client:latest ./client

# If using a remote registry, tag and push
# docker tag team-sigma/eureka:latest your-registry/team-sigma/eureka:latest
# docker push your-registry/team-sigma/eureka:latest
# (repeat for all images)
```

## Deployment Options

### Option 1: Using Kustomize (Recommended)

```bash
# Deploy all resources at once
kubectl apply -k k8s/

# Check deployment status
kubectl get all -n team-sigma

# View logs
kubectl logs -n team-sigma deployment/eureka
kubectl logs -n team-sigma deployment/api-gateway
kubectl logs -n team-sigma deployment/hello-service
kubectl logs -n team-sigma deployment/client
```

### Option 2: Individual Manifests

```bash
# Apply in order (respecting dependencies)
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/eureka-deployment.yaml

# Wait for Eureka to be ready
kubectl wait --for=condition=available --timeout=300s deployment/eureka -n team-sigma

# Deploy remaining services
kubectl apply -f k8s/hello-service-deployment.yaml
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/client-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

## Accessing the Application

### Using NodePort (Local Development)

If using Minikube, get the cluster IP:

```bash
minikube ip
```

Access services at:

- **Client**: `http://<cluster-ip>:30000`
- **API Gateway**: `http://<cluster-ip>:30080`
- **Eureka Dashboard**: `http://<cluster-ip>:30761`

### Using Ingress (Production-like)

1. Install NGINX Ingress Controller:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

2. Add to `/etc/hosts`:

```
<ingress-ip> team-sigma.local
```

3. Access at:

- **Client**: `http://team-sigma.local`
- **API Gateway**: `http://team-sigma.local/api`
- **Eureka**: `http://team-sigma.local/eureka`

## Key Kubernetes Features Added

### Health Checks

- **Liveness Probes**: Restart unhealthy containers
- **Readiness Probes**: Only route traffic to ready containers

### Resource Management

- **Resource Requests/Limits**: Proper resource allocation
- **Multiple Replicas**: High availability for stateless services

### Dependency Management

- **Init Containers**: Wait for Eureka before starting dependent services
- **Service Discovery**: Automatic DNS-based service discovery

### Configuration Management

- **ConfigMaps**: Centralized configuration
- **Environment Variables**: Service-specific configuration

## Scaling

Scale services independently:

```bash
# Scale API Gateway
kubectl scale deployment api-gateway --replicas=3 -n team-sigma

# Scale Hello Service
kubectl scale deployment hello-service --replicas=5 -n team-sigma

# Scale Client
kubectl scale deployment client --replicas=3 -n team-sigma
```

## Monitoring and Debugging

```bash
# View all resources
kubectl get all -n team-sigma

# Describe a deployment
kubectl describe deployment api-gateway -n team-sigma

# View logs
kubectl logs -f deployment/api-gateway -n team-sigma

# Execute into a pod
kubectl exec -it deployment/api-gateway -n team-sigma -- /bin/sh

# Port forward for debugging
kubectl port-forward service/eureka 8761:8761 -n team-sigma
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k k8s/

# Or delete namespace (removes everything)
kubectl delete namespace team-sigma
```

## Production Considerations

1. **Image Registry**: Use a proper image registry instead of local images
2. **Secrets Management**: Use Kubernetes Secrets for sensitive data
3. **Persistent Storage**: Add persistent volumes if needed
4. **Monitoring**: Integrate with Prometheus/Grafana
5. **Service Mesh**: Consider Istio for advanced traffic management
6. **Backup**: Implement backup strategies for stateful components
