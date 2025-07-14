@echo off
setlocal enabledelayedexpansion

rem Environment Setup Script for Windows
rem Configures the build environment and loads appropriate environment variables

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=development

set PROJECT_ROOT=%~dp0..

echo 🔧 Setting up environment: %ENVIRONMENT%

rem Validate environment
if "%ENVIRONMENT%"=="development" goto valid
if "%ENVIRONMENT%"=="staging" goto valid
if "%ENVIRONMENT%"=="production" goto valid

echo ❌ Invalid environment: %ENVIRONMENT%
echo Valid options: development, staging, production
exit /b 1

:valid
echo ✅ Valid environment: %ENVIRONMENT%

rem Copy environment file
set ENV_FILE=%PROJECT_ROOT%\.env.%ENVIRONMENT%
set TARGET_FILE=%PROJECT_ROOT%\.env

if exist "%ENV_FILE%" (
  echo 📋 Copying %ENV_FILE% to %TARGET_FILE%
  copy "%ENV_FILE%" "%TARGET_FILE%" >nul
) else (
  echo ❌ Environment file not found: %ENV_FILE%
  exit /b 1
)

rem Add build metadata
echo. >> "%TARGET_FILE%"
echo # Build Metadata (auto-generated) >> "%TARGET_FILE%"

rem Get current timestamp
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set BUILD_DATE=%%d-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set BUILD_TIME=%%a:%%b
echo VITE_BUILD_DATE=%BUILD_DATE%T%BUILD_TIME%:00Z >> "%TARGET_FILE%"

rem Add git commit if available
where git >nul 2>&1
if !errorlevel! equ 0 (
  for /f "tokens=*" %%a in ('git rev-parse HEAD 2^>nul') do (
    set GIT_COMMIT=%%a
    echo VITE_GIT_COMMIT=!GIT_COMMIT! >> "%TARGET_FILE%"
    echo 📝 Added git commit: !GIT_COMMIT:~0,8!
  )
)

echo ✅ Environment setup complete for: %ENVIRONMENT%
echo.
echo 📄 Current environment configuration:
echo ----------------------------------------
findstr /r "^NODE_ENV\|^VITE_" "%TARGET_FILE%" 2>nul | findstr /v /r "^$"
echo ----------------------------------------
