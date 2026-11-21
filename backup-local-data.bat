@echo off
setlocal
cd /d "%~dp0"
if not exist backups mkdir backups

echo This exports a copy of the local database and uploaded image files.
echo It does not delete or modify the running database.
echo.

docker cp "%cd%\scripts\dump-mysql.sh" sonpur-clinic-mysql:/tmp/dump-mysql.sh
if errorlevel 1 goto :failed

echo [1/2] Exporting MySQL database...
docker exec -i sonpur-clinic-mysql sh /tmp/dump-mysql.sh > "backups\sonpur_clinic.sql"
if errorlevel 1 goto :failed

echo [2/2] Exporting uploaded QR, logo, and payment proof files...
docker exec -i sonpur-clinic-api sh -c "tar -czf - -C /app/uploads ." > "backups\sonpur_uploads.tar.gz"
if errorlevel 1 goto :failed

echo.
echo Backup created in:
echo %cd%\backups\sonpur_clinic.sql
echo %cd%\backups\sonpur_uploads.tar.gz
echo.
echo Keep these files private. They contain patient and payment data.
echo Do not upload them to GitHub or share them publicly.
pause
exit /b 0

:failed
echo.
echo Backup failed. Check that docker compose services mysql and backend are running.
pause
exit /b 1
