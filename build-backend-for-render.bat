@echo off
setlocal
cd /d "%~dp0"

echo Building Sonpur Dental Clinic backend JAR for Render...
docker run --rm -v "%cd%\backend:/workspace" -w /workspace maven:3.9.9-eclipse-temurin-21 mvn -B -DskipTests clean package
if errorlevel 1 goto :failed

if not exist "backend\target\sonpur-dental-clinic-api-1.0.0.jar" (
  echo ERROR: Backend JAR was not generated.
  goto :failed
)

echo.
echo Backend JAR ready:
echo %cd%\backend\target\sonpur-dental-clinic-api-1.0.0.jar
echo.
echo The repository is configured to include this one JAR for Render Docker builds.
echo Now run: git status, git add ., git commit, git push.
echo Do not upload .env or patient backups to GitHub.
pause
exit /b 0

:failed
echo.
echo Backend build failed. See Maven output above.
pause
exit /b 1
