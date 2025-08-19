-- ============================================================================
-- FIX ADMIN PERMISSIONS - Allow Service Role to Bypass RLS
-- ============================================================================
-- This script fixes the "User not allowed" error by adding admin policies
-- that allow the service role key to bypass Row Level Security

-- ============================================================================
-- STEP 1: Add Admin Policies for Service Role
-- ============================================================================

-- Allow service role to bypass RLS on users table
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to bypass RLS on doctors table  
CREATE POLICY "Service role can manage all doctors" ON doctors
    FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to bypass RLS on doctor_availability table
CREATE POLICY "Service role can manage all availability" ON doctor_availability
    FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to bypass RLS on appointments table
CREATE POLICY "Service role can manage all appointments" ON appointments
    FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to bypass RLS on service_categories table
CREATE POLICY "Service role can manage all service categories" ON service_categories
    FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to bypass RLS on notifications table
CREATE POLICY "Service role can manage all notifications" ON notifications
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- STEP 2: Alternative - Disable RLS for Development (Optional)
-- ============================================================================
-- Uncomment the following lines if you prefer to disable RLS completely for development

/*
-- Disable RLS on all tables (for development only)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
*/

-- ============================================================================
-- STEP 3: Verify the Fix
-- ============================================================================

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'doctors', 'doctor_availability', 'appointments', 'service_categories', 'notifications')
ORDER BY tablename;

-- Check policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'users'
ORDER BY policyname;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Admin permissions fix completed successfully!';
    RAISE NOTICE 'Service role can now bypass RLS and perform admin operations.';
    RAISE NOTICE 'Try creating a doctor again - the "User not allowed" error should be resolved.';
END $$;
