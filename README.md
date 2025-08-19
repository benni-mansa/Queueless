# Queueless App (Expo)

This is the Expo/React Native app for Queueless. For full documentation, see the repository root `README.md`.

## Quick Start

```bash
npm install
cp .env.example .env   # or copy manually on Windows
npm start
```

## Environment

The app reads from `.env` first, then falls back to `app.config.js` `extra` values. Required keys:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional (DO NOT include in public builds or commits)
SUPABASE_SERVICE_ROLE_KEY=
```

See `src/config/env.ts` for the loader/validator logic.

## Scripts

- `npm start` – Start Expo
- `npm run android` – Android emulator
- `npm run ios` – iOS simulator (macOS)
- `npm run web` – Web preview

## Supabase

Run the schema in `database-setup.sql` inside your Supabase project. Then set env vars, restart the dev server, and test auth/booking flows.

## Project Structure

```
src/
  components/  screens/  navigation/  services/  config/  hooks/  types/
```

For detailed usage, troubleshooting, and deployment, refer to the root `README.md`.
