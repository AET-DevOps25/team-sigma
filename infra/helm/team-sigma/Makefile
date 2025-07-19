@PHONY: install-infisical, install-infisical-admin, install-prod, upgrade-prod, list-prod, delete-prod, create-secret

install-prod:
	helm install team-sigma .  --namespace nemo --kube-context student --wait --timeout 5m

upgrade-prod:
	helm upgrade team-sigma . --namespace nemo --kube-context student --wait --timeout 5m

list-prod:
	kubectl get all -n nemo --context student

delete-prod:
	kubectl delete namespace nemo --context student

create-secrets:
	@if [ -z "$(SECRETS)" ]; then echo "Error: SECRETS is required. Usage: make create-secrets SECRETS=<key1=value1,key2=value2>"; exit 1; fi
	kubectl create secret generic nemo-secret --from-literal="$(SECRETS)" --namespace nemo --context student --dry-run=client -o yaml | kubectl apply -f -
	@echo "Secrets created successfully in namespace nemo"

get-secret:
	kubectl get secrets --namespace nemo --context student -o yaml
