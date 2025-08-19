@echo off
echo Creating .env file for Hospital Queue App...
echo.

REM Check if .env already exists
if exist .env (
    echo .env file already exists!
    echo Please edit it manually or delete it first.
    pause
    exit /b
)

REM Copy from example
copy config.env.example .env

if exist .env (
    echo.
    echo .env file created successfully!
    echo.
    echo Please edit .env file and add your actual Supabase credentials:
    echo 1. EXPO_PUBLIC_SUPABASE_URL
    echo 2. EXPO_PUBLIC_SUPABASE_ANON_KEY  
    echo 3. SUPABASE_SERVICE_ROLE_KEY
    echo.
    echo You can find these in your Supabase project dashboard under Settings > API
    echo.
    echo After editing, restart your React Native app.
    echo.
    pause
) else (
    echo Failed to create .env file!
    echo Please create it manually by copying config.env.example to .env
    pause
)
