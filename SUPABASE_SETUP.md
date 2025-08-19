# Supabase Setup Guide

## Prerequisites
- A Supabase account ([sign up here](https://supabase.com))
- A Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Create Environment File

1. Copy `config.env.example` to `.env`:
   ```bash
   cp config.env.example .env
   ```

2. Edit `.env` and fill in your actual values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 3: Run Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database-setup.sql`
4. Paste and run the SQL script

## Step 4: Test Configuration

1. Start your Expo development server:
   ```bash
   npm start
   ```

2. The app should now connect to Supabase without errors

## Environment Variables Explained

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Public API key for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations (server-side only)
- `DATABASE_URL`: Direct database connection string (optional)

## Security Notes

- **Never commit your `.env` file** to version control
- The `EXPO_PUBLIC_` prefix makes variables available in your React Native app
- Use `SUPABASE_SERVICE_ROLE_KEY` only on the server side
- The anon key is safe to use in client-side code

## Troubleshooting

### "Missing environment variable" error
- Ensure `.env` file exists and has correct values
- Restart your Expo development server after creating `.env`
- Check that variable names match exactly (including `EXPO_PUBLIC_` prefix)

### Connection errors
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure your IP is not blocked by Supabase

### Database errors
- Run the `database-setup.sql` script in Supabase SQL Editor
- Check that Row Level Security policies are properly configured
- Verify table permissions in Supabase dashboard
