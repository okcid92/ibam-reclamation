"""
Tests unitaires — Connexion / Déconnexion (IBAM Réclamation)
Selenium garde le navigateur ouvert entre chaque test.
Chaque résultat s'affiche immédiatement : PASS ou ERROR.
"""

import unittest
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Codes couleur ANSI pour le terminal
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


# ---------------------------------------------------------------------------
# Runner personnalisé : affiche PASS / ERROR après chaque test
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
        print(f"{BOLD}  IBAM Réclamation — Tests unitaires ({total} tests){RESET}")
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
# Tests : le navigateur est ouvert une seule fois pour tous les tests
# ---------------------------------------------------------------------------

class TestAuthentification(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()
        cls.driver.maximize_window()
        cls.base_url = "http://localhost:8000"

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    # --- Helpers ---

    def _go_to_login(self):
        """Ouvre la page d'accueil et attend que le formulaire soit prêt."""
        self.driver.get(self.base_url)
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        )

    def _fill_and_submit(self, login, password):
        """Saisit les identifiants et clique sur Connexion."""
        self.driver.find_element(By.ID, "login").send_keys(login)
        self.driver.find_element(By.ID, "password").send_keys(password)
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    def _logout(self):
        """Clique sur Déconnexion et attend le retour sur /login."""
        btn = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Déconnexion')]"))
        )
        btn.click()
        WebDriverWait(self.driver, 10).until(EC.url_contains("/login"))

    # --- Cas de test ---

    def test_1_connexion_etudiant(self):
        """Connexion étudiant avec son INE"""
        self._go_to_login()
        self._fill_and_submit("N01331820231", "M!@926732")
        WebDriverWait(self.driver, 10).until(EC.url_contains("/dashboard"))
        self.assertIn("/student/dashboard", self.driver.current_url)

    def test_2_deconnexion_etudiant(self):
        """Déconnexion de l'étudiant"""
        self._logout()
        self.assertIn("/login", self.driver.current_url)

    def test_3_connexion_scolarite(self):
        """Connexion scolarité avec son email"""
        self._go_to_login()
        self._fill_and_submit("scolarite@ibam.edu", "M!@926732")
        WebDriverWait(self.driver, 10).until(EC.url_contains("/dashboard"))
        self.assertIn("/scolarite/dashboard", self.driver.current_url)

    def test_4_deconnexion_scolarite(self):
        """Déconnexion de la scolarité"""
        self._logout()
        self.assertIn("/login", self.driver.current_url)

    def test_5_mauvais_identifiant(self):
        """Connexion avec un identifiant inexistant"""
        self._go_to_login()
        self._fill_and_submit("MAUVAIS_ID", "M!@926732")
        error = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-red-50"))
        )
        self.assertIsNotNone(error)
        self.assertIn("/login", self.driver.current_url)

    def test_6_mauvais_mot_de_passe(self):
        """Connexion avec un mauvais mot de passe"""
        self._go_to_login()
        self._fill_and_submit("N01331820231", "mauvais_password")
        error = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-red-50"))
        )
        self.assertIsNotNone(error)
        self.assertIn("/login", self.driver.current_url)

    def test_7_champs_vides(self):
        """Soumission du formulaire avec des champs vides"""
        self._go_to_login()
        self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        login_field = self.driver.find_element(By.ID, "login")
        self.assertIsNotNone(login_field.get_attribute("validationMessage"))
        self.assertIn("/login", self.driver.current_url)


# ---------------------------------------------------------------------------
# Point d'entrée
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    suite  = unittest.TestLoader().loadTestsFromTestCase(TestAuthentification)
    result = IbamTestRunner().run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
