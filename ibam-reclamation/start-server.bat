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
echo     - scolarite@ibam.edu / password (Scolarite)
echo     - enseignant@ibam.edu / password (Yaya Traore)
echo     - directeur@ibam.edu / password (Gilbert Bayili)
echo     - da.adjoint@ibam.edu / password (Directeur Adjoint)
echo.
echo ========================================
echo.

php artisan serve