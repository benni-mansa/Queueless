-- ============================================================================
-- DEBUG: Doctor Names Not Showing in Appointments Screen
-- ============================================================================
-- This script helps debug why doctor names aren't displaying properly

-- ============================================================================
-- STEP 1: Check the current data structure
-- ============================================================================

-- Check what's in the doctors table
SELECT 'Doctors Table:' as info;
SELECT 
    id,
    user_id,
    specialty,
    created_at
FROM doctors
LIMIT 5;

-- Check what's in the users table
SELECT 'Users Table:' as info;
SELECT 
    id,
    name,
    phone,
    role,
    created_at
FROM users
WHERE role = 'doctor'
LIMIT 5;

-- ============================================================================
-- STEP 2: Check the foreign key relationship
-- ============================================================================

-- Check if the foreign key constraint exists
SELECT 'Foreign Key Constraints:' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'doctors';

-- ============================================================================
-- STEP 3: Test the join manually
-- ============================================================================

-- Test the join that the app is trying to do
SELECT 'Manual Join Test:' as info;
SELECT 
    d.id as doctor_id,
    d.user_id,
    d.specialty,
    u.id as user_id,
    u.name as user_name,
    u.role as user_role
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
LIMIT 5;

-- ============================================================================
-- STEP 4: Check for data inconsistencies
-- ============================================================================

-- Check if there are doctors without corresponding users
SELECT 'Doctors without users:' as info;
SELECT 
    d.id as doctor_id,
    d.user_id,
    d.specialty
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
WHERE u.id IS NULL;

-- Check if there are users with doctor role but no doctor record
SELECT 'Users with doctor role but no doctor record:' as info;
SELECT 
    u.id as user_id,
    u.name,
    u.role
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.role = 'doctor' AND d.id IS NULL;

-- ============================================================================
-- STEP 5: Sample data for testing
-- ============================================================================

-- Show a complete sample for debugging
SELECT 'Complete Sample Data:' as info;
SELECT 
    d.id as doctor_id,
    d.user_id,
    d.specialty,
    u.name as doctor_name,
    u.phone as doctor_phone,
    u.role as user_role
FROM doctors d
JOIN users u ON d.user_id = u.id
LIMIT 3;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Debug script completed!';
    RAISE NOTICE 'Check the results above to identify the issue with doctor names.';
    RAISE NOTICE 'Common issues:';
    RAISE NOTICE '1. Missing foreign key constraint';
    RAISE NOTICE '2. Data not properly inserted';
    RAISE NOTICE '3. User names are null/empty';
    RAISE NOTICE '4. Role mismatch between users and doctors tables';
END $$;
