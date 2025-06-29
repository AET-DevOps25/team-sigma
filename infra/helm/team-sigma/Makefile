@PHONY: install-infisical, install-infisical-admin, install-prod, upgrade-prod, list-prod, delete-prod

install-infisical:
	helm repo add infisical-helm-charts https://dl.infisical.com/helm-charts || true
	helm repo update
	kubectl create namespace nemo --dry-run=client -o yaml | kubectl apply -f -
	@echo "Note: Infisical agent injector requires cluster-admin permissions."
	@echo "Alternatives:"
	@echo "1. Ask your cluster admin to install: helm install --generate-name infisical-helm-charts/infisical-agent-injector --namespace nemo"
	@echo "2. Use Infisical CLI directly in your pods"
	@echo "3. Use manual secret management"
	@echo "4. If you have admin permissions, run: make install-infisical-admin"

install-infisical-admin:
	helm repo add infisical-helm-charts https://dl.infisical.com/helm-charts || true
	helm repo update
	kubectl create namespace nemo --dry-run=client -o yaml | kubectl apply -f -
	helm install --generate-name infisical-helm-charts/infisical-agent-injector --namespace nemo --kube-context student --wait --timeout 5m

install-prod:
	helm install team-sigma .  --namespace nemo --kube-context student --wait --timeout 5m

upgrade-prod:
	helm upgrade team-sigma . --namespace nemo --kube-context student --wait --timeout 5m

list-prod:
	kubectl get all -n nemo --context student

delete-prod:
	kubectl delete namespace nemo --context student
