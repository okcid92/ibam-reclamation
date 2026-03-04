"""test unitaire. de connexion et de deconnexion d'un utilisateur
on va utiliser les donnees qui sont dans les seeder pour faire les tests avec selenium"""

import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestAuthentification(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.driver = webdriver.Chrome()
        cls.driver.maximize_window()
        cls.base_url = "http://localhost:8000"
    
    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
    
    def authLogin(self, login, password):
        driver = self.driver
        driver.get(self.base_url)
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        )
        
        driver.find_element(By.ID, "login").send_keys(login)
        driver.find_element(By.ID, "password").send_keys(password)
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        WebDriverWait(driver, 10).until(
            EC.url_contains("/dashboard")
        )
    
    def test_1_connexion_etudiant(self):
        self.authLogin("N01331820231", "password")
        self.assertIn("/student/dashboard", self.driver.current_url)
    
    def test_2_deconnexion(self):
        driver = self.driver
        
        logout_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Déconnexion')]"))
        )
        logout_button.click()
        
        WebDriverWait(driver, 10).until(
            EC.url_contains("/login")
        )
        
        self.assertIn("/login", driver.current_url)
    
    def test_3_connexion_scolarite(self):
        self.authLogin("scolarite@ibam.edu", "password")
        self.assertIn("/scolarite/dashboard", self.driver.current_url)
    
    def test_4_mauvais_identifiant(self):
        driver = self.driver
        driver.get(self.base_url)
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        )
        
        driver.find_element(By.ID, "login").send_keys("MAUVAIS_ID")
        driver.find_element(By.ID, "password").send_keys("password")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        error_message = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-red-50"))
        )
        
        self.assertIsNotNone(error_message)
        self.assertIn("/login", driver.current_url)
    
    def test_5_mauvais_mot_de_passe(self):
        driver = self.driver
        driver.get(self.base_url)
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        )
        
        driver.find_element(By.ID, "login").send_keys("N01331820231")
        driver.find_element(By.ID, "password").send_keys("mauvais_password")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        error_message = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".bg-red-50"))
        )
        
        self.assertIsNotNone(error_message)
        self.assertIn("/login", driver.current_url)
    
    def test_6_champs_vides(self):
        driver = self.driver
        driver.get(self.base_url)
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        )
        
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        login_field = driver.find_element(By.ID, "login")
        validation_message = login_field.get_attribute("validationMessage")
        
        self.assertIsNotNone(validation_message)
        self.assertIn("/login", driver.current_url)

if __name__ == "__main__":
    unittest.main()
