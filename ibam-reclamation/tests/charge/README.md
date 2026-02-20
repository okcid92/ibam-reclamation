# Test de Charge - IBAM Réclamation

## Objectif
Tester la performance du système sous charge avec plusieurs utilisateurs simultanés.

## Installation

```bash
pip install -r requirements.txt
```

## Exécution

### Mode Web UI (recommandé)
```bash
locust -f charge_test.py --host=http://127.0.0.1:8000
```
Puis ouvrir http://localhost:8089 dans le navigateur.

### Mode ligne de commande
```bash
# 10 utilisateurs, 2 par seconde, durée 60s
locust -f charge_test.py --host=http://127.0.0.1:8000 --users 10 --spawn-rate 2 --run-time 60s --headless
```

### Scénarios avancés

**Test léger** (10 utilisateurs)
```bash
locust -f charge_test.py --host=http://127.0.0.1:8000 --users 10 --spawn-rate 2 --run-time 60s --headless
```

**Test moyen** (50 utilisateurs)
```bash
locust -f charge_test.py --host=http://127.0.0.1:8000 --users 50 --spawn-rate 5 --run-time 120s --headless
```

**Test intensif** (100 utilisateurs)
```bash
locust -f charge_test.py --host=http://127.0.0.1:8000 --users 100 --spawn-rate 10 --run-time 180s --headless
```

## Classes d'utilisateurs

1. **StudentUser** (Étudiant)
   - Consulter dashboard (poids: 3)
   - Créer réclamation (poids: 1)
   - Consulter matières (poids: 2)

2. **ScolariteUser** (Scolarité)
   - Consulter toutes réclamations (poids: 5)
   - Traiter réclamation (poids: 1)

3. **TeacherUser** (Enseignant)
   - Consulter mes réclamations (poids: 4)
   - Donner avis (poids: 1)

## Métriques surveillées

- **Temps de réponse** : Moyenne, médiane, 95e percentile
- **Taux de requêtes** : Requêtes/seconde
- **Taux d'erreur** : Pourcentage d'échecs
- **Utilisateurs simultanés** : Nombre d'utilisateurs actifs

## Résultats attendus

- Temps de réponse < 500ms pour 90% des requêtes
- Taux d'erreur < 1%
- Support de 50+ utilisateurs simultanés
