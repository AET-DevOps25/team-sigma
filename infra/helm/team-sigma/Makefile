@PHONY: install-prod, upgrade-prod, list-prod, delete-prod

install-prod:
	helm install team-sigma . --namespace team-sigma --kube-context student

upgrade-prod:
	helm upgrade team-sigma . --namespace team-sigma --kube-context student

list-prod:
	kubectl get all -n team-sigma --context student

delete-prod:
	kubectl delete namespace team-sigma --context student
