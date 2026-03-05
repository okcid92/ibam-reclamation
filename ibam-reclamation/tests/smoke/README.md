# Test de fumée — Dépôt de réclamation

Script Python Selenium qui vérifie le parcours complet de dépôt d'une réclamation par un étudiant, en testant les données valides et les données invalides.

## Prérequis

```bash
pip install selenium
```

Google Chrome et ChromeDriver doivent être installés et accessibles dans le `PATH`.  
Le serveur Laravel doit tourner sur `http://localhost:8000`.

## Lancer les tests

```bash
python3 tests/smoke/testfumee.py
```

## Ce que fait le script

### Comportement général

- L'étudiant se connecte **une seule fois** au début (`setUpClass` → `_login`).
- Le navigateur reste ouvert pendant tous les tests.
- Après chaque soumission valide, la page redirige vers `/student/dashboard` — le test suivant re-navigue automatiquement vers le formulaire.
- Les valeurs invalides (notes négatives, > 20, lettres) sont forcées dans les champs via **JavaScript** pour contourner les contraintes HTML (`min`/`max`) et tester la validation côté serveur (backend Laravel).

### Sortie dans le terminal

```
───────────────────────────────────────────────────
  IBAM Réclamation — Test de fumée (9 tests)
───────────────────────────────────────────────────

  ▶ Soumission valide : note 12.5 → 15, motif complet       ... ✅ PASS
  ▶ Note actuelle négative (-5) → erreur de validation       ... ✅ PASS
  ▶ Note espérée supérieure à 20 (25) → erreur de validation ... ✅ PASS
  ▶ Notes saisies en lettres ('abc') → erreur de validation  ... ✅ PASS
  ▶ Notes décimales valides (11.75 → 14.25) → acceptée       ... ✅ PASS
  ▶ Motif trop court (< 10 caractères) → erreur             ... ✅ PASS
  ▶ Soumission sans sélectionner de matière → erreur         ... ✅ PASS
  ▶ Note actuelle supérieure à 20 (21) → erreur              ... ✅ PASS
  ▶ Déconnexion en fin de session                            ... ✅ PASS

───────────────────────────────────────────────────
  ✅ PASS : 9   ❌ ERROR : 0   Total : 9
───────────────────────────────────────────────────
```

### Les 9 cas de test

| # | Nom | Données testées | Résultat attendu |
|---|-----|-----------------|-----------------|
| 1 | `test_1_soumission_valide` | note 12.5 → 15, motif complet, matière sélectionnée | Succès + redirection dashboard |
| 2 | `test_2_note_actuelle_negative` | note actuelle = **-5** | Erreur validation |
| 3 | `test_3_note_esperee_superieure_20` | note espérée = **25** | Erreur validation |
| 4 | `test_4_notes_en_lettres` | notes = **"abc"** / **"xyz"** | Erreur validation |
| 5 | `test_5_note_decimale_valide` | note 11.75 → 14.25 | Succès + redirection dashboard |
| 6 | `test_6_motif_trop_court` | motif = "Court" (5 chars, min requis = 10) | Erreur validation |
| 7 | `test_7_sans_matiere` | aucune matière sélectionnée | Erreur validation |
| 8 | `test_8_note_actuelle_superieure_20` | note actuelle = **21** | Erreur validation |
| 9 | `test_9_deconnexion` | clic sur Déconnexion | Retour sur `/login` |

### Règles métier vérifiées

Les contraintes suivantes sont validées côté **backend** (Laravel) :
- `current_grade` : nullable, numérique, **entre 0 et 20**
- `expected_grade` : nullable, numérique, **entre 0 et 20**
- `reason` : obligatoire, chaîne, **minimum 10 caractères**
- `subject_id` : obligatoire, doit exister dans la table `matieres`

> Les valeurs invalides sont injectées via `execute_script` JavaScript pour contourner les attributs `min`/`max` du champ HTML et tester réellement la validation serveur.

## Structure du code

```
testfumee.py
│
├── IbamTestResult      # Affiche PASS/ERROR en temps réel (couleurs ANSI)
├── IbamTestRunner      # Lance la suite et affiche le résumé final
│
└── TestFumeeReclamation   # Classe de tests (unittest.TestCase)
    ├── setUpClass()        # Ouvre Chrome + connexion étudiant
    ├── tearDownClass()     # Ferme Chrome
    ├── _login()            # Connexion initiale (appelée une fois)
    ├── _open_form()        # Navigue vers /student/create-claim
    ├── _set_grade()        # Force une valeur numérique via JS (contourne min/max HTML)
    ├── _select_first_subject() # Sélectionne la 1ère matière de la liste
    ├── _fill_reason()      # Saisit le motif
    ├── _submit()           # Clique sur Soumettre
    ├── _wait_for_error()   # Attend le bandeau d'erreur rouge (.bg-red-100)
    ├── _wait_for_success() # Attend le bandeau de succès vert (.bg-green-100)
    └── test_1 … test_9     # Les 9 cas de test
```
