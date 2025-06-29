@PHONY: install-prod, upgrade-prod, list-prod, delete-prod

install-prod:
	helm install team-sigma .  --namespace nemo --kube-context student --wait --timeout 5m

upgrade-prod:
	helm upgrade team-sigma . --namespace nemo --kube-context student --wait --timeout 5m

list-prod:
	kubectl get all -n nemo --context student

delete-prod:
	kubectl delete namespace nemo --context student
