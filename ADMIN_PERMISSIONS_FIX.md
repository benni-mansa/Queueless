# Admin Permissions Fix Guide

## Problem Description

You're encountering the error:
```
ERROR  Error saving doctor: [AuthApiError: User not allowed]
ERROR  Admin: Error creating doctor: {"error": [AuthApiError: User not allowed], "message": "User not allowed"}
```

This error occurs because the admin service is trying to perform database operations using the service role key, but the database has Row Level Security (RLS) enabled without proper admin policies.

## Root Cause

1. **RLS is Enabled**: Your database has Row Level Security enabled on all tables
2. **Missing Admin Policies**: There are no policies that allow the service role to bypass RLS
3. **Mixed Client Usage**: The admin service was using both `supabase` (anon key) and `supabaseAdmin` (service role key) clients inconsistently

## What I Fixed

### 1. Updated Admin Service (`src/services/adminService.ts`)
- **Changed all database operations to use `supabaseAdmin`** instead of the regular `supabase` client
- This ensures all admin operations use the service role key with proper permissions
- Fixed functions: `getDoctors`, `getDoctorById`, `createDoctor`, `updateDoctor`, `deleteDoctor`, etc.

### 2. Fixed Schema Mismatch
- Removed incorrect `start_date` field from doctor availability creation (table only has `date` field)

## Solutions (Choose One)

### Option 1: Add Admin Policies (Recommended for Production)
Run the `fix-admin-permissions.sql` script in your Supabase SQL Editor:

```sql
-- This adds policies allowing the service role to bypass RLS
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all doctors" ON doctors
    FOR ALL USING (auth.role() = 'service_role');

-- ... and similar policies for other tables
```

### Option 2: Disable RLS for Development (Quick Fix)
Run the `disable-rls-for-development.sql` script in your Supabase SQL Editor:

```sql
-- This disables RLS on all tables for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
-- ... and similar for other tables
```

**⚠️ Warning**: Only use Option 2 for development/testing, not production!

## How to Apply the Fix

### Step 1: Run the SQL Script
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste one of the fix scripts above
4. Execute the script

### Step 2: Test the Fix
1. Restart your React Native app
2. Try to create a doctor again
3. The "User not allowed" error should be resolved

## Verification

After running the fix, you can verify it worked by checking:

```sql
-- Check RLS status (should show false if disabled, or true with proper policies)
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'doctors', 'doctor_availability', 'appointments', 'service_categories', 'notifications')
ORDER BY tablename;

-- Check policies (if using Option 1)
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'users'
ORDER BY policyname;
```

## Why This Happened

1. **Supabase RLS**: By default, Supabase enables Row Level Security on all tables
2. **Service Role vs Anon Key**: The service role key has higher privileges but still needs explicit policies to bypass RLS
3. **Mixed Client Usage**: Using both clients inconsistently caused permission issues

## Prevention for Future

1. **Consistent Client Usage**: Always use `supabaseAdmin` for admin operations
2. **Proper RLS Policies**: Set up comprehensive policies before enabling RLS in production
3. **Environment Separation**: Use different policies for development vs production

## Files Modified

- `src/services/adminService.ts` - Updated to use `supabaseAdmin` consistently
- `fix-admin-permissions.sql` - Script to add admin policies
- `disable-rls-for-development.sql` - Script to disable RLS for development

## Next Steps

1. **Apply the fix** using one of the SQL scripts
2. **Test doctor creation** to verify the error is resolved
3. **Review other admin functions** to ensure they work properly
4. **Consider security implications** for production deployment

## Support

If you still encounter issues after applying the fix:

1. Check the Supabase logs for detailed error messages
2. Verify your service role key is correctly set in `.env`
3. Ensure the SQL script executed successfully
4. Check that all tables have the expected permissions

The fix should resolve the "User not allowed" error and allow you to create doctors successfully.
