@echo off
echo ========================================
echo    IBAM - Systeme de Reclamations
echo ========================================
echo.

echo [1/4] Installation des dependances PHP...
call composer install --no-dev --optimize-autoloader

echo.
echo [2/4] Installation des dependances Node.js...
call npm install

echo.
echo [3/4] Configuration de l'environnement...
if not exist .env (
    copy .env.example .env
    php artisan key:generate
)

echo.
echo [4/4] Preparation de la base de donnees...
php artisan migrate --force
php artisan db:seed --force

echo.
echo ========================================
echo   Installation terminee avec succes!
echo ========================================
echo.
echo Pour demarrer l'application:
echo   1. php artisan serve
echo   2. npm run dev (dans un autre terminal)
echo.
echo Acces: http://localhost:8000
echo.
echo Comptes de test:
echo   Etudiant: INE N01331820231 / password
echo   Staff: scolarite@ibam.edu / password
echo.
pause