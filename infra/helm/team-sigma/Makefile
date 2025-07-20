.PHONY: install-prod upgrade-prod list-prod delete-prod create-secrets get-secret reload-prod prepare-grafana-config prepare-prometheus-config prepare-config build-helm clean-helm

# Prepare Grafana configuration for Helm deployment
prepare-grafana-config:
	@echo "===== Preparing Grafana configuration for Helm ====="
	@mkdir -p dashboards
	@cp ../../../build/config/grafana/dashboards/*.json dashboards/
	@echo "Grafana dashboard files copied to Helm chart"

# Prepare Prometheus configuration for Helm deployment
prepare-prometheus-config:
	@echo "===== Preparing Prometheus configuration for Helm ====="
	@mkdir -p prometheus
	@cp ../../../build/config/prometheus/*.yml prometheus/
	@echo "Prometheus configuration files copied to Helm chart"

# Prepare all configuration files
prepare-config: prepare-grafana-config prepare-prometheus-config

install-prod: prepare-config
	helm install team-sigma .  --namespace nemo --kube-context student --wait --timeout 5m

upgrade-prod: prepare-config
	helm upgrade team-sigma . --namespace nemo --kube-context student --wait --timeout 5m

list-prod:
	kubectl get all -n nemo --context student

reload-prod:
	kubectl rollout restart deployment -n nemo --context student

delete-prod:
	kubectl delete namespace nemo --context student

create-secrets:
	@if [ -z "$(SECRETS)" ]; then echo "Error: SECRETS is required. Usage: make create-secrets SECRETS=<key1=value1,key2=value2>"; exit 1; fi
	kubectl create secret generic nemo-secret --from-literal="$(SECRETS)" --namespace nemo --context student --dry-run=client -o yaml | kubectl apply -f -
	@echo "Secrets created successfully in namespace nemo"

get-secret:
	kubectl get secrets --namespace nemo --context student -o yaml
