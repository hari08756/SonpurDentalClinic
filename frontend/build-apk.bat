@echo off
setlocal
cd /d "%~dp0"

echo =====================================================
echo  Sonpur Dental Clinic - Android APK Builder
echo =====================================================
echo.

if not exist .env.production (
  copy .env.android.example .env.production >nul
  echo Created frontend\.env.production from the example.
  echo.
  echo IMPORTANT: Edit frontend\.env.production and replace YOUR_BACKEND_URL
  echo with the real public API URL from Render, then run build-apk.bat again.
  notepad .env.production
  pause
  exit /b 1
)

findstr /i "YOUR_BACKEND_URL" .env.production >nul
if not errorlevel 1 (
  echo ERROR: Set VITE_API_BASE to your real Render API URL in .env.production.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js 22 or newer is required.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js 22+.
  pause
  exit /b 1
)

echo [1/4] Installing web and Capacitor packages...
call npm install
if errorlevel 1 goto :failed

echo.
echo [2/4] Building production web files...
call npm run build
if errorlevel 1 goto :failed

echo.
if not exist android (
  echo [3/4] Creating Android project...
  call npx cap add android
  if errorlevel 1 goto :failed
) else (
  echo [3/4] Android project already exists.
)

echo Syncing Capacitor files...
call npx cap sync android
if errorlevel 1 goto :failed

echo.
echo [4/4] Building installable debug APK...
pushd android
call gradlew.bat assembleDebug
if errorlevel 1 (
  popd
  goto :failed
)
popd

echo.
echo APK CREATED:
echo %cd%\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Copy this APK to the clinic phones and install it.
echo Every phone must have internet access to use the shared cloud data.
echo.
pause
exit /b 0

:failed
echo.
echo APK build failed. Review the error above.
echo Make sure Android Studio and Android SDK are installed, then retry.
echo.
pause
exit /b 1
