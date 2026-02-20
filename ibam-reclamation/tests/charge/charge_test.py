"""Test de charge - IBAM Réclamation avec Locust"""

from locust import HttpUser, task, between
import random
import base64


class StudentUser(HttpUser):
    """Simule un étudiant utilisant le système"""
    wait_time = between(1, 3)
    
    def on_start(self):
        """Connexion au démarrage"""
        self.login()
    
    def login(self):
        """Connexion étudiant"""
        credentials = base64.b64encode(b"1:password").decode()
        response = self.client.post("/api/login", json={
            "username": "N01331820231",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})
    
    @task(3)
    def view_dashboard(self):
        """Consulter le tableau de bord"""
        self.client.get("/api/claims", headers={"Authorization": f"Bearer {self.token}"})
    
    @task(1)
    def create_claim(self):
        """Créer une réclamation"""
        self.client.post("/api/claims", json={
            "subject_id": random.randint(1, 5),
            "reason": "Test de charge - réclamation automatique",
            "current_grade": random.uniform(0, 15),
            "expected_grade": random.uniform(15, 20)
        }, headers={"Authorization": f"Bearer {self.token}"})
    
    @task(2)
    def view_subjects(self):
        """Consulter les matières"""
        self.client.get("/api/subjects")


class ScolariteUser(HttpUser):
    """Simule un agent de scolarité"""
    wait_time = between(2, 5)
    
    def on_start(self):
        """Connexion au démarrage"""
        self.login()
    
    def login(self):
        """Connexion scolarité"""
        credentials = base64.b64encode(b"2:password").decode()
        response = self.client.post("/api/login", json={
            "username": "scolarite@ibam.edu",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})
    
    @task(5)
    def view_all_claims(self):
        """Consulter toutes les réclamations"""
        self.client.get("/api/claims", headers={"Authorization": f"Bearer {self.token}"})
    
    @task(1)
    def process_claim(self):
        """Traiter une réclamation"""
        # Récupérer une réclamation aléatoire
        response = self.client.get("/api/claims", headers={"Authorization": f"Bearer {self.token}"})
        if response.status_code == 200:
            claims = response.json()
            if claims:
                claim_id = random.choice(claims)["id"]
                self.client.put(f"/api/claims/{claim_id}", json={
                    "action": random.choice(["approve", "reject"]),
                    "comment": "Traitement automatique - test de charge"
                }, headers={"Authorization": f"Bearer {self.token}"})


class TeacherUser(HttpUser):
    """Simule un enseignant"""
    wait_time = between(3, 6)
    
    def on_start(self):
        """Connexion au démarrage"""
        self.login()
    
    def login(self):
        """Connexion enseignant"""
        response = self.client.post("/api/login", json={
            "username": "yaya.traore@ibam.edu",
            "password": "password"
        })
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})
    
    @task(4)
    def view_my_claims(self):
        """Consulter mes réclamations"""
        self.client.get("/api/claims", headers={"Authorization": f"Bearer {self.token}"})
    
    @task(1)
    def give_opinion(self):
        """Donner un avis sur une réclamation"""
        response = self.client.get("/api/claims", headers={"Authorization": f"Bearer {self.token}"})
        if response.status_code == 200:
            claims = response.json()
            if claims:
                claim_id = random.choice(claims)["id"]
                self.client.put(f"/api/claims/{claim_id}", json={
                    "action": random.choice(["approve", "reject"]),
                    "comment": "Avis automatique - test de charge",
                    "corrected_grade": random.uniform(10, 20)
                }, headers={"Authorization": f"Bearer {self.token}"})
