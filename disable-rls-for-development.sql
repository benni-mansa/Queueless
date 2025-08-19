-- ============================================================================
-- DISABLE RLS FOR DEVELOPMENT
-- ============================================================================
-- This script disables Row Level Security on all tables for development
-- This is a quick fix for the "User not allowed" error
-- WARNING: Only use this for development/testing, not production!

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'doctors', 'doctor_availability', 'appointments', 'service_categories', 'notifications')
ORDER BY tablename;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE 'RLS disabled successfully for development!';
    RAISE NOTICE 'The "User not allowed" error should now be resolved.';
    RAISE NOTICE 'Try creating a doctor again.';
    RAISE WARNING 'Remember to re-enable RLS with proper policies before production!';
END $$;
