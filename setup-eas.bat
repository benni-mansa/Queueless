@echo off
echo ========================================
echo Hospital Queue App - EAS Setup Script
echo ========================================
echo.

echo Installing global dependencies...
echo Installing Expo CLI...
npm install -g @expo/cli
echo.

echo Installing EAS CLI...
npm install -g eas-cli
echo.

echo Installing project dependencies...
npm install
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create a .env file with your Supabase credentials
echo 2. Run: eas login
echo 3. Run: eas build:configure
echo 4. Run: npm run build:android-preview
echo.
echo See EAS_BUILD_GUIDE.md for detailed instructions
echo.
pause
