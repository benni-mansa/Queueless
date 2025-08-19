-- ============================================================================
-- TEST: Appointment Booking Validation
-- ============================================================================
-- This script tests the appointment booking validation to ensure it works correctly
-- Run this after applying the fix to verify everything is working

-- ============================================================================
-- STEP 1: Check if the functions and triggers exist
-- ============================================================================

-- Check functions
SELECT 'Functions Status:' as status;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'validate_appointment_booking',
        'mark_slot_unavailable_after_booking',
        'mark_slot_available_after_cancellation',
        'get_available_time_slots'
    );

-- Check triggers
SELECT 'Triggers Status:' as status;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND trigger_name IN (
        'validate_appointment_booking_trigger',
        'mark_slot_unavailable_after_booking_trigger',
        'mark_slot_available_after_cancellation_trigger'
    );

-- ============================================================================
-- STEP 2: Test the get_available_time_slots function
-- ============================================================================

-- First, let's see what doctors we have
SELECT 'Available Doctors:' as info;
SELECT 
    d.id as doctor_id,
    u.name as doctor_name,
    d.specialty
FROM doctors d
JOIN users u ON d.user_id = u.id
LIMIT 5;

-- Test the availability function (replace with actual doctor ID)
SELECT 'Testing get_available_time_slots function:' as info;
-- Note: Replace 'your-doctor-uuid-here' with an actual doctor ID from above
-- SELECT * FROM get_available_time_slots('your-doctor-uuid-here'::uuid, CURRENT_DATE + INTERVAL '1 day');

-- ============================================================================
-- STEP 3: Check current availability data
-- ============================================================================

SELECT 'Current Availability Data:' as info;
SELECT 
    da.doctor_id,
    da.date,
    da.start_time,
    da.end_time,
    da.is_available,
    COUNT(a.id) as existing_appointments
FROM doctor_availability da
LEFT JOIN appointments a ON 
    da.doctor_id = a.doctor_id 
    AND da.date = a.slot_time::date 
    AND da.start_time <= a.slot_time::time 
    AND da.end_time > a.slot_time::time
    AND a.status NOT IN ('cancelled', 'no_show')
GROUP BY da.id, da.doctor_id, da.date, da.start_time, da.end_time, da.is_available
ORDER BY da.doctor_id, da.date, da.start_time
LIMIT 10;

-- ============================================================================
-- STEP 4: Check current appointments
-- ============================================================================

SELECT 'Current Appointments:' as info;
SELECT 
    a.id,
    a.doctor_id,
    a.slot_time,
    a.status,
    u.name as patient_name
FROM appointments a
JOIN users u ON a.patient_id = u.id
ORDER BY a.slot_time DESC
LIMIT 10;

-- ============================================================================
-- STEP 5: Manual test instructions
-- ============================================================================

SELECT 'Manual Testing Instructions:' as info;
SELECT 
    '1. Try to book an appointment on an available time slot - should succeed' as test_step
UNION ALL
SELECT '2. Try to book on an unavailable time slot - should fail with clear error' as test_step
UNION ALL
SELECT '3. Try to double-book the same slot - should fail with conflict error' as test_step
UNION ALL
SELECT '4. Cancel an appointment - slot should become available again' as test_step;

-- ============================================================================
-- STEP 6: Verify trigger function syntax
-- ============================================================================

-- This will show any syntax errors in the functions
SELECT 'Function Syntax Check:' as info;
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname IN (
        'validate_appointment_booking',
        'mark_slot_unavailable_after_booking',
        'mark_slot_available_after_cancellation'
    );

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Test script completed successfully!';
    RAISE NOTICE 'Check the results above to verify:';
    RAISE NOTICE '1. All functions and triggers exist';
    RAISE NOTICE '2. No syntax errors in functions';
    RAISE NOTICE '3. Availability data is present';
    RAISE NOTICE '4. Appointments can be validated';
    RAISE NOTICE '';
    RAISE NOTICE 'If everything looks good, try booking an appointment in the app!';
END $$;
