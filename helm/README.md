# Team Sigma Helm Chart

A comprehensive Helm chart for deploying the Team Sigma microservices architecture. This chart significantly reduces duplication by providing flexible templates that can handle all service types.

## Features

- **Unified Configuration**: Single `values.yaml` file to configure all services
- **Environment-specific Overrides**: Separate values files for dev and production
- **Flexible Service Templates**: One template handles all service types (frontend, gateway, microservices)
- **Built-in Service Discovery**: Automated Eureka integration
- **Development-friendly**: NodePort services for easy local access
- **Production-ready**: Ingress with TLS support
- **Resource Management**: Configurable resource requests and limits
- **Health Checks**: Automated liveness and readiness probes

## Duplication Reduction

This Helm chart replaces:

- 4 separate deployment YAML files (79-63 lines each) → 1 template (85 lines)
- 4+ separate service YAML files → 1 template (21 lines)
- 3 separate NodePort service files → 1 template (25 lines)
- Hardcoded configurations → Centralized values

**Total reduction**: ~350 lines of YAML → ~130 lines of templates + values

## Installation

### Prerequisites

- Kubernetes cluster
- Helm 3.x installed
- kubectl configured

### Quick Start

```bash
# Install in default mode
helm install team-sigma ./helm/team-sigma

# Install for development
helm install team-sigma ./helm/team-sigma -f ./helm/team-sigma/values-dev.yaml

# Install for production
helm install team-sigma ./helm/team-sigma -f ./helm/team-sigma/values-prod.yaml
```

## Configuration

### Key Configuration Sections

#### Global Settings

```yaml
global:
  namespace: team-sigma
  imageRegistry: team-sigma
  imageTag: latest
  imagePullPolicy: IfNotPresent
```

#### Service Configuration

Each service can be individually configured:

```yaml
services:
  client:
    enabled: true
    replicas: 2
    resources:
      requests:
        memory: "64Mi"
        cpu: "50m"
    # ... more options
```

#### Environment Variables

Configure environment variables per service:

```yaml
services:
  api-gateway:
    env:
      - name: SPRING_APPLICATION_NAME
        value: "api-gateway"
      - name: EUREKA_CLIENT_SERVICEURL_DEFAULTZONE
        valueFrom:
          configMapKeyRef:
            name: team-sigma-config
            key: EUREKA_URL
```

### Available Values Files

- `values.yaml` - Default configuration
- `values-dev.yaml` - Development overrides (reduced resources, NodePort enabled)
- `values-prod.yaml` - Production overrides (increased resources, TLS)

## Usage Examples

### Deploy to Development

```bash
helm install team-sigma-dev ./helm/team-sigma \
  -f ./helm/team-sigma/values-dev.yaml \
  --set global.imageTag=dev-latest
```

### Deploy to Production

```bash
helm install team-sigma-prod ./helm/team-sigma \
  -f ./helm/team-sigma/values-prod.yaml \
  --set ingress.host=team-sigma.yourdomain.com
```

### Enable/Disable Services

```bash
# Disable hello-service
helm upgrade team-sigma ./helm/team-sigma \
  --set services.hello-service.enabled=false
```

### Update Image Tags

```bash
helm upgrade team-sigma ./helm/team-sigma \
  --set global.imageTag=v1.2.3
```

## Service Access

### Development (NodePort enabled)

- Client: http://localhost:30000
- API Gateway: http://localhost:30080
- Eureka: http://localhost:30761

### Production (Ingress)

- Client: https://team-sigma.yourdomain.com/
- API Gateway: https://team-sigma.yourdomain.com/api
- Eureka: https://team-sigma.yourdomain.com/eureka

## Monitoring and Troubleshooting

```bash
# Check pod status
kubectl get pods -n team-sigma

# View logs
kubectl logs -f deployment/api-gateway -n team-sigma

# Port forward for debugging
kubectl port-forward svc/eureka 8761:8761 -n team-sigma
```

## Adding New Services

To add a new service, simply add it to the `services` section in `values.yaml`:

```yaml
services:
  new-service:
    enabled: true
    name: new-service
    component: microservice
    image: new-service
    replicas: 2
    port: 8082
    containerPort: 8082
    # ... other configuration
```

The templates will automatically generate all necessary Kubernetes resources.

## Chart Structure

```
helm/team-sigma/
├── Chart.yaml                 # Chart metadata
├── values.yaml               # Default configuration
├── values-dev.yaml           # Development overrides
├── values-prod.yaml          # Production overrides
├── README.md                 # This file
└── templates/
    ├── _helpers.tpl          # Helper templates
    ├── namespace.yaml        # Namespace template
    ├── configmap.yaml        # ConfigMap template
    ├── deployment.yaml       # Deployment template (handles all services)
    ├── service.yaml          # Service template (handles all services)
    ├── nodeport-service.yaml # NodePort services for development
    ├── ingress.yaml          # Ingress template
    └── NOTES.txt             # Post-install notes
```

## Best Practices

1. **Use environment-specific values files** for different deployment environments
2. **Version your Helm releases** for easy rollbacks
3. **Use ConfigMaps** for environment variables that change between environments
4. **Set resource limits** to prevent resource starvation
5. **Use init containers** for service dependencies (like waiting for Eureka)

## Rollback

```bash
# List releases
helm list

# View release history
helm history team-sigma

# Rollback to previous version
helm rollback team-sigma 1
```
