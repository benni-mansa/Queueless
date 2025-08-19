# Database Setup for Hospital Queue App

## Overview
This project now uses a single, comprehensive database setup file instead of multiple migration files.

## Files
- **`database-setup.sql`** - The only SQL file you need. Contains all tables, indexes, triggers, and policies.

## How to Set Up Your Database

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Database Setup
1. Copy the entire contents of `database-setup.sql`
2. Paste it into the SQL editor
3. Click **Run** to execute the script

### Step 3: Verify Setup
The script will automatically run verification queries and show you:
- All created tables
- Foreign key constraints
- Success message

## What This Script Creates

### Tables
- **`users`** - User profiles (extends auth.users)
- **`doctors`** - Doctor information
- **`doctor_availability`** - Doctor scheduling
- **`appointments`** - Patient appointments
- **`service_categories`** - Medical service types
- **`notifications`** - User notifications

### Features
- ✅ Proper foreign key constraints
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Automatic timestamp updates
- ✅ Helper functions for scheduling
- ✅ Sample service categories

## Troubleshooting

### If You Get Foreign Key Errors
The script now properly handles the relationship between `auth.users` and the custom `users` table. The foreign key constraint is correctly set up.

### If You See "Auth session missing" Errors
This is **normal and expected** during user signup. The error occurs because:
- `supabase.auth.getUser()` requires an active session
- During signup, the user doesn't have a session yet
- The app handles this gracefully and continues with profile creation
- This error does NOT indicate a problem with your setup

### If Tables Don't Exist
Make sure you're running the script in the correct Supabase project and that you have the necessary permissions.

### If RLS Policies Fail
The script creates comprehensive RLS policies. If you encounter issues, check that your Supabase project has RLS enabled.

## Next Steps
After running the database setup:
1. Test user signup in your app
2. Verify that user profiles are created successfully
3. Test creating doctors and appointments

## Support
If you encounter any issues, check the console logs in your app for detailed error information.
