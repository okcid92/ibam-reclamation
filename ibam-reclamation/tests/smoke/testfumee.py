"""
Test de fumée — Dépôt de réclamation (IBAM Réclamation)

On se connecte en tant qu'étudiant, puis on soumet des réclamations
avec des données valides et invalides :
  - notes négatives, supérieures à 20, en lettres
  - valeurs décimales, motif trop court, matière manquante

Le navigateur reste ouvert entre chaque test.

Pourquoi on retire min/max/required en JavaScript ?
  Les champs HTML5 bloquent la soumission du formulaire AVANT que React
  ou le backend ne voient les données. On les retire pour pouvoir tester
  la validation côté serveur (Laravel) et côté React.

Pourquoi le setter natif (Object.getOwnPropertyDescriptor) ?
  React utilise un système d'événements synthétiques. Un simple
  `element.value = x` ne met pas à jour l'état React. Le setter natif
  du prototype + un événement 'input' le force correctement.
"""

import unittest
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL      = "http://localhost:8000"
CREATE_URL    = f"{BASE_URL}/student/create-claim"
DASHBOARD_URL = f"{BASE_URL}/student/dashboard"

STUDENT_INE      = "N01331820231"
STUDENT_PASSWORD = "M!@926732"

# Couleurs ANSI
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


# ---------------------------------------------------------------------------
# Runner personnalisé (identique au test unitaire)
# ---------------------------------------------------------------------------

class IbamTestResult(unittest.TestResult):

    def startTest(self, test):
        super().startTest(test)
        label = test.shortDescription() or test._testMethodName
        print(f"  {YELLOW}▶ {label}{RESET}", end=" ... ", flush=True)

    def addSuccess(self, test):
        super().addSuccess(test)
        print(f"{GREEN}{BOLD}PASS{RESET}")

    def _print_error(self, test, err):
        msg = self._exc_info_to_string(err, test).splitlines()[-1]
        print(f"{RED}{BOLD}ERROR{RESET}  {RED}{msg}{RESET}")

    def addFailure(self, test, err):
        super().addFailure(test, err)
        self._print_error(test, err)

    def addError(self, test, err):
        super().addError(test, err)
        self._print_error(test, err)

    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        print(f"{YELLOW}SKIP{RESET}  {reason}")


class IbamTestRunner:

    def run(self, suite):
        total = suite.countTestCases()
        print(f"\n{BOLD}{'─' * 55}{RESET}")
        print(f"{BOLD}  IBAM Réclamation — Test de fumée ({total} tests){RESET}")
        print(f"{BOLD}{'─' * 55}{RESET}\n")

        result = IbamTestResult()
        suite.run(result)

        passed = total - len(result.failures) - len(result.errors)
        failed = len(result.failures) + len(result.errors)

        print(f"\n{BOLD}{'─' * 55}{RESET}")
        print(f"  {GREEN}✅ PASS : {passed}{RESET}   {RED}❌ ERROR : {failed}{RESET}   Total : {total}")
        print(f"{BOLD}{'─' * 55}{RESET}\n")

        return result


# ---------------------------------------------------------------------------
# Script JS réutilisables
# ---------------------------------------------------------------------------

# Met à jour l'état React d'un <input> ou <textarea> avec une nouvelle valeur.
# Utilise le setter natif du prototype pour contourner le système d'événements React.
_JS_SET_INPUT = """
    var setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    ).set;
    setter.call(arguments[0], arguments[1]);
    arguments[0].dispatchEvent(new Event('input',  { bubbles: true }));
    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
"""

_JS_SET_TEXTAREA = """
    var setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
    ).set;
    setter.call(arguments[0], arguments[1]);
    arguments[0].dispatchEvent(new Event('input',  { bubbles: true }));
    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
"""

_JS_SET_SELECT = """
    var setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype, 'value'
    ).set;
    setter.call(arguments[0], arguments[1]);
    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
"""

# Prépare le formulaire : retire min/max/required pour que la validation
# soit gérée uniquement par React et le backend (pas par le navigateur).
# Marque aussi les champs de note avec data-grade=0 et data-grade=1.
_JS_PREPARE_FORM = """
    var grades = document.querySelectorAll('input[type="number"]');
    grades.forEach(function(el, i) {
        el.setAttribute('data-grade', i);
        el.removeAttribute('min');
        el.removeAttribute('max');
    });
    document.querySelectorAll('select[required], textarea[required]').forEach(function(el) {
        el.removeAttribute('required');
    });
"""

# Pour le test "notes en lettres" : change le type en "text" pour accepter
# des caractères non numériques, puis injecte la valeur.
_JS_SET_GRADE_TEXT = """
    arguments[0].type = 'text';
    var setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    ).set;
    setter.call(arguments[0], arguments[1]);
    arguments[0].dispatchEvent(new Event('input',  { bubbles: true }));
    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
"""


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestFumeeReclamation(unittest.TestCase):
    """Test de fumée — dépôt de réclamation en tant qu'étudiant."""

    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()
        cls.driver.maximize_window()
        cls._login()

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    @classmethod
    def _login(cls):
        """Connexion initiale — une seule fois avant tous les tests."""
        cls.driver.get(BASE_URL)
        WebDriverWait(cls.driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        )
        cls.driver.find_element(By.ID, "login").send_keys(STUDENT_INE)
        cls.driver.find_element(By.ID, "password").send_keys(STUDENT_PASSWORD)
        cls.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        WebDriverWait(cls.driver, 10).until(EC.url_contains("/student/dashboard"))

    # --- Helpers ---

    def _open_form(self):
        """Ouvre le formulaire et prépare les champs pour les tests."""
        self.driver.get(CREATE_URL)
        # Attendre que les matières soient chargées (au moins 1 option réelle)
        WebDriverWait(self.driver, 10).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "select option")) > 1
        )
        # Retirer les contraintes HTML5 et marquer les champs de note
        self.driver.execute_script(_JS_PREPARE_FORM)

    def _select_first_subject(self):
        """Sélectionne la première matière de la liste (déclenche le onChange React)."""
        select_elem = self.driver.find_element(By.CSS_SELECTOR, "select")
        options = select_elem.find_elements(By.TAG_NAME, "option")
        first_value = options[1].get_attribute("value")  # options[0] = placeholder
        self.driver.execute_script(_JS_SET_SELECT, select_elem, first_value)

    def _set_grade(self, index, value):
        """Injecte une valeur numérique dans le champ note (index 0 = actuelle, 1 = espérée)."""
        field = self.driver.find_element(By.CSS_SELECTOR, f"[data-grade='{index}']")
        self.driver.execute_script(_JS_SET_INPUT, field, str(value))

    def _set_grade_text(self, index, text):
        """Injecte du texte non numérique dans un champ note (pour tester la règle 'numeric')."""
        field = self.driver.find_element(By.CSS_SELECTOR, f"[data-grade='{index}']")
        self.driver.execute_script(_JS_SET_GRADE_TEXT, field, text)

    def _fill_reason(self, text):
        """Saisit le motif dans le textarea (déclenche le onChange React)."""
        textarea = self.driver.find_element(By.CSS_SELECTOR, "textarea")
        self.driver.execute_script(_JS_SET_TEXTAREA, textarea, text)

    def _submit(self):
        """Clique sur le bouton Soumettre."""
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    def _wait_for_error(self):
        """Attend le bandeau d'erreur rouge (.bg-red-100)."""
        return WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-red-100"))
        )

    def _wait_for_success(self):
        """Attend le bandeau de succès vert (.bg-green-100)."""
        return WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-green-100"))
        )

    # --- Cas de test ---

    def test_1_soumission_valide(self):
        """Soumission valide : note 12.5 → 15, motif complet"""
        self._open_form()
        self._select_first_subject()
        self._set_grade(0, 12.5)
        self._set_grade(1, 15)
        self._fill_reason("Ma copie a été mal corrigée, je conteste la note attribuée.")
        self._submit()
        self._wait_for_success()
        WebDriverWait(self.driver, 15).until(EC.url_contains("/student/dashboard"))
        self.assertIn("/student/dashboard", self.driver.current_url)

    def test_2_note_actuelle_negative(self):
        """Note actuelle négative (-5) → erreur de validation"""
        self._open_form()
        self._select_first_subject()
        self._set_grade(0, -5)
        self._set_grade(1, 10)
        self._fill_reason("Test de note négative pour vérifier la validation du formulaire.")
        self._submit()
        self._wait_for_error()
        self.assertIn("/create-claim", self.driver.current_url)

    def test_3_note_esperee_superieure_20(self):
        """Note espérée supérieure à 20 (25) → erreur de validation"""
        self._open_form()
        self._select_first_subject()
        self._set_grade(0, 10)
        self._set_grade(1, 25)
        self._fill_reason("Test de note espérée trop élevée pour vérifier la validation du formulaire.")
        self._submit()
        self._wait_for_error()
        self.assertIn("/create-claim", self.driver.current_url)

    def test_4_notes_en_lettres(self):
        """Notes saisies en lettres ('abc', 'xyz') → erreur de validation (règle numeric)"""
        self._open_form()
        self._select_first_subject()
        # _set_grade_text change le champ en type="text" pour accepter des lettres
        # et met à jour l'état React → le backend reçoit "abc" et rejette (numeric)
        self._set_grade_text(0, "abc")
        self._set_grade_text(1, "xyz")
        self._fill_reason("Test de caractères non numériques pour vérifier la validation du formulaire.")
        self._submit()
        self._wait_for_error()
        self.assertIn("/create-claim", self.driver.current_url)

    def test_5_note_decimale_valide(self):
        """Notes décimales valides (11.75 → 14.25) → soumission acceptée"""
        self._open_form()
        self._select_first_subject()
        self._set_grade(0, 11.75)
        self._set_grade(1, 14.25)
        self._fill_reason("Réclamation avec des notes décimales, la correction semble incomplète.")
        self._submit()
        self._wait_for_success()
        WebDriverWait(self.driver, 15).until(EC.url_contains("/student/dashboard"))
        self.assertIn("/student/dashboard", self.driver.current_url)

    def test_6_motif_trop_court(self):
        """Motif trop court (< 10 caractères) → erreur de validation"""
        self._open_form()
        self._select_first_subject()
        self._set_grade(0, 10)
        self._set_grade(1, 14)
        self._fill_reason("Court")  # 5 caractères — minimum requis : 10
        self._submit()
        self._wait_for_error()
        self.assertIn("/create-claim", self.driver.current_url)

    def test_7_sans_matiere(self):
        """Soumission sans sélectionner de matière → erreur de validation"""
        self._open_form()
        # Aucune matière sélectionnée (option vide par défaut)
        self._set_grade(0, 10)
        self._set_grade(1, 14)
        self._fill_reason("Test sans matière sélectionnée pour vérifier la validation du formulaire.")
        self._submit()
        self._wait_for_error()
        self.assertIn("/create-claim", self.driver.current_url)

    def test_8_note_actuelle_superieure_20(self):
        """Note actuelle supérieure à 20 (21) → erreur de validation"""
        self._open_form()
        self._select_first_subject()
        self._set_grade(0, 21)
        self._set_grade(1, 18)
        self._fill_reason("Test avec note actuelle supérieure à 20 pour vérifier la validation.")
        self._submit()
        self._wait_for_error()
        self.assertIn("/create-claim", self.driver.current_url)

    def test_9_deconnexion(self):
        """Déconnexion en fin de session"""
        self.driver.get(DASHBOARD_URL)
        btn = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Déconnexion')]"))
        )
        btn.click()
        WebDriverWait(self.driver, 10).until(EC.url_contains("/login"))
        self.assertIn("/login", self.driver.current_url)


# ---------------------------------------------------------------------------
# Point d'entrée
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    suite  = unittest.TestLoader().loadTestsFromTestCase(TestFumeeReclamation)
    result = IbamTestRunner().run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
