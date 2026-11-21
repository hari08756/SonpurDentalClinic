@echo off
setlocal
cd /d "%~dp0"

if not exist .env copy .env.example .env >nul

echo.
echo =====================================================
echo  Sonpur Dental Clinic - Build and Start
echo =====================================================
echo.

echo [1/3] Building backend JAR with Maven in Docker...
docker run --rm -v "%cd%\backend:/workspace" -w /workspace maven:3.9.9-eclipse-temurin-21 mvn -B -DskipTests clean package
if errorlevel 1 goto :build_failed

if not exist "backend\target\sonpur-dental-clinic-api-1.0.0.jar" (
  echo ERROR: Expected backend JAR was not created.
  goto :build_failed
)

echo.
echo [2/3] Building application images...
docker compose build
if errorlevel 1 goto :build_failed

echo.
echo [3/3] Starting clinic services...
docker compose up -d
if errorlevel 1 goto :build_failed

echo.
echo Sonpur Dental Clinic is starting.
echo Website: http://localhost:8081
echo Backend: http://localhost:8080
echo.
echo Recent backend logs:
docker compose logs --tail=80 backend

echo.
pause
exit /b 0

:build_failed
echo.
echo BUILD/START FAILED. Review the error above.
echo Your MySQL named volume was not deleted by this script.
echo.
pause
exit /b 1
