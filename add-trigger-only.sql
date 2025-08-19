-- ============================================================================
-- ADD TRIGGER ONLY - For existing databases
-- ============================================================================
-- Run this script in your Supabase SQL editor to add the automatic user profile creation trigger
-- This will fix the foreign key constraint violation without recreating your existing tables

-- ============================================================================
-- STEP 1: Drop existing trigger and function (if they exist)
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- ============================================================================
-- STEP 2: Create the trigger function
-- ============================================================================

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract user metadata from auth.users
    INSERT INTO public.users (id, name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Create the trigger
-- ============================================================================

-- Trigger that fires when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STEP 4: Verification
-- ============================================================================

-- Verify the trigger function was created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'handle_new_user';

-- Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND trigger_name = 'on_auth_user_created';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Trigger setup completed successfully!';
    RAISE NOTICE 'The automatic user profile creation trigger is now active.';
    RAISE NOTICE 'New user signups will automatically create profiles without foreign key errors.';
END $$;
