# Tests unitaires — Connexion / Déconnexion

Script Python Selenium qui teste l'authentification de l'application IBAM Réclamation.

## Prérequis

```bash
pip install selenium
```

Le navigateur **Google Chrome** et son driver **ChromeDriver** doivent être installés et accessibles dans le `PATH`.  
Le serveur Laravel doit tourner sur `http://localhost:8000`.

## Lancer les tests

```bash
python3 tests/Unit/testunitaire.py
```

## Ce que fait le script

### Comportement général

- **Un seul navigateur** est ouvert pour tous les tests (`setUpClass`) et fermé seulement à la fin (`tearDownClass`). Il n'est jamais relancé entre deux tests.
- **Chaque résultat s'affiche immédiatement** dans le terminal dès que le test se termine, grâce à un runner personnalisé (`IbamTestRunner`).

### Sortie dans le terminal

```
───────────────────────────────────────────────────
  IBAM Réclamation — Tests unitaires (7 tests)
───────────────────────────────────────────────────

  ▶ Connexion étudiant avec son INE         ... ✅ PASS
  ▶ Déconnexion de l'étudiant               ... ✅ PASS
  ▶ Connexion scolarité avec son email      ... ✅ PASS
  ▶ Déconnexion de la scolarité             ... ✅ PASS
  ▶ Connexion avec un identifiant inexistant ... ✅ PASS
  ▶ Connexion avec un mauvais mot de passe  ... ✅ PASS
  ▶ Soumission du formulaire avec des champs vides ... ✅ PASS

───────────────────────────────────────────────────
  ✅ PASS : 7   ❌ ERROR : 0   Total : 7
───────────────────────────────────────────────────
```

### Les 7 cas de test

| # | Nom | Ce qui est vérifié |
|---|-----|--------------------|
| 1 | `test_1_connexion_etudiant` | Un étudiant peut se connecter avec son INE → redirigé vers `/student/dashboard` |
| 2 | `test_2_deconnexion_etudiant` | Après connexion, le bouton Déconnexion ramène sur `/login` |
| 3 | `test_3_connexion_scolarite` | Un agent scolarité peut se connecter avec son email → redirigé vers `/scolarite/dashboard` |
| 4 | `test_4_deconnexion_scolarite` | Même vérification de déconnexion pour la scolarité |
| 5 | `test_5_mauvais_identifiant` | Un identifiant inconnu affiche un message d'erreur (`.bg-red-50`) et reste sur `/login` |
| 6 | `test_6_mauvais_mot_de_passe` | Un mot de passe incorrect affiche un message d'erreur et reste sur `/login` |
| 7 | `test_7_champs_vides` | Soumettre le formulaire vide déclenche la validation HTML native du champ `login` |

## Structure du code

```
testunitaire.py
│
├── IbamTestResult      # Sous-classe de unittest.TestResult
│   │                   # Intercepte chaque résultat pour l'afficher en temps réel
│   ├── startTest()     # Affiche le nom du test en cours
│   ├── addSuccess()    # Affiche PASS en vert
│   ├── _print_error()  # Helper partagé : affiche ERROR + message en rouge
│   ├── addFailure()    # Appelle _print_error (assertion échouée)
│   └── addError()      # Appelle _print_error (exception inattendue)
│
├── IbamTestRunner      # Lance la suite et affiche le résumé final
│   └── run()
│
└── TestAuthentification  # Classe de tests (unittest.TestCase)
    ├── setUpClass()     # Ouvre Chrome une seule fois
    ├── tearDownClass()  # Ferme Chrome après tous les tests
    ├── _go_to_login()   # Helper : navigue vers la page de connexion
    ├── _fill_and_submit() # Helper : remplit et soumet le formulaire
    ├── _logout()        # Helper : clique sur Déconnexion
    └── test_1 … test_7  # Les 7 cas de test
```
