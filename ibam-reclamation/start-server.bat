@echo off
echo ========================================
echo    IBAM - Systeme de Reclamations
echo         DEMARRAGE DU SERVEUR
echo ========================================
echo.

echo [INFO] Demarrage du serveur Laravel...
echo.
echo Acces: http://localhost:8000
echo.
echo Comptes de test:
echo   Etudiants (connexion par INE):
echo     - INE: N01331820231 / password (Alou Dicko)
echo     - INE: N01331820232 / password (Albert Naba)
echo.
echo   Personnel (connexion par email):
echo     - scolarite@ibam.edu / password (Agent Scolarite)
echo     - yaya.traore@ibam.edu / password (Yaya Traore - Enseignant)
echo     - adjoint.directeur@ibam.edu / password (Directeur Adjoint)
echo.
echo ========================================
echo.

php artisan serve