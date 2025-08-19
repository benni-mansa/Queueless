-- ============================================================================
-- FIX: Appointment Validation - Prevent booking on unavailable slots
-- ============================================================================
-- This file adds database-level validation to prevent patients from booking
-- appointments on dates and times that haven't been allocated for availability

-- ============================================================================
-- STEP 1: Create a function to validate appointment bookings
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_appointment_booking()
RETURNS TRIGGER AS $$
DECLARE
    appointment_date DATE;
    appointment_time TIME;
    slot_available BOOLEAN;
    conflicting_appointment BOOLEAN;
BEGIN
    -- Extract date and time from the appointment slot_time
    appointment_date := NEW.slot_time::date;
    appointment_time := NEW.slot_time::time;
    
    -- Check if the doctor has availability for this date and time
    SELECT EXISTS(
        SELECT 1 FROM doctor_availability 
        WHERE doctor_id = NEW.doctor_id 
            AND date = appointment_date 
            AND start_time <= appointment_time 
            AND end_time > appointment_time
            AND is_available = true
    ) INTO slot_available;
    
    -- If no availability record exists, the slot is not available
    IF NOT slot_available THEN
        RAISE EXCEPTION 'Cannot book appointment: No availability allocated for doctor % on % at %', 
            NEW.doctor_id, appointment_date, appointment_time;
    END IF;
    
    -- Check for conflicting appointments (same doctor, same time, not cancelled/no-show)
    SELECT EXISTS(
        SELECT 1 FROM appointments 
        WHERE doctor_id = NEW.doctor_id 
            AND slot_time = NEW.slot_time
            AND status NOT IN ('cancelled', 'no_show')
            AND id != NEW.id  -- Exclude current appointment if updating
    ) INTO conflicting_appointment;
    
    IF conflicting_appointment THEN
        RAISE EXCEPTION 'Cannot book appointment: Time slot already booked for doctor % on % at %', 
            NEW.doctor_id, appointment_date, appointment_time;
    END IF;
    
    -- If we get here, the booking is valid
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 2: Create trigger to validate appointments before insert/update
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_appointment_booking_trigger ON appointments;

-- Create the trigger
CREATE TRIGGER validate_appointment_booking_trigger
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION validate_appointment_booking();

-- ============================================================================
-- STEP 3: Create a function to mark time slots as unavailable after booking
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_slot_unavailable_after_booking()
RETURNS TRIGGER AS $$
DECLARE
    appointment_date DATE;
    appointment_time TIME;
    slot_duration INTERVAL;
BEGIN
    -- Extract date and time from the appointment slot_time
    appointment_date := NEW.slot_time::date;
    appointment_time := NEW.slot_time::time;
    
    -- Default slot duration is 30 minutes
    slot_duration := '30 minutes'::interval;
    
    -- Mark the time slot as unavailable in doctor_availability
    UPDATE doctor_availability 
    SET is_available = false
    WHERE doctor_id = NEW.doctor_id 
        AND date = appointment_date 
        AND start_time <= appointment_time 
        AND end_time > appointment_time;
    
    -- If no rows were updated, it means no availability record exists
    -- This should not happen due to the validation trigger, but log it
    IF NOT FOUND THEN
        RAISE WARNING 'No availability record found to mark as unavailable for appointment %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: Create trigger to mark slots unavailable after successful booking
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS mark_slot_unavailable_after_booking_trigger ON appointments;

-- Create the trigger
CREATE TRIGGER mark_slot_unavailable_after_booking_trigger
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION mark_slot_unavailable_after_booking();

-- ============================================================================
-- STEP 5: Create a function to mark time slots as available after cancellation
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_slot_available_after_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    appointment_date DATE;
    appointment_time TIME;
    other_appointments BOOLEAN;
BEGIN
    -- Only process when status changes to cancelled or no_show
    IF NEW.status NOT IN ('cancelled', 'no_show') OR OLD.status IN ('cancelled', 'no_show') THEN
        RETURN NEW;
    END IF;
    
    -- Extract date and time from the appointment slot_time
    appointment_date := NEW.slot_time::date;
    appointment_time := NEW.slot_time::time;
    
    -- Check if there are other active appointments for this time slot
    SELECT EXISTS(
        SELECT 1 FROM appointments 
        WHERE doctor_id = NEW.doctor_id 
            AND slot_time = NEW.slot_time
            AND status NOT IN ('cancelled', 'no_show')
            AND id != NEW.id
    ) INTO other_appointments;
    
    -- If no other appointments exist for this time slot, mark it as available
    IF NOT other_appointments THEN
        UPDATE doctor_availability 
        SET is_available = true
        WHERE doctor_id = NEW.doctor_id 
            AND date = appointment_date 
            AND start_time <= appointment_time 
            AND end_time > appointment_time;
        
        -- If no rows were updated, it means no availability record exists
        IF NOT FOUND THEN
            RAISE WARNING 'No availability record found to mark as available after cancellation for appointment %', NEW.id;
    END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: Create trigger to mark slots available after cancellation
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS mark_slot_available_after_cancellation_trigger ON appointments;

-- Create the trigger
CREATE TRIGGER mark_slot_available_after_cancellation_trigger
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION mark_slot_available_after_cancellation();

-- ============================================================================
-- STEP 7: Create a function to get available time slots with proper validation
-- ============================================================================

CREATE OR REPLACE FUNCTION get_available_time_slots(
    p_doctor_id UUID,
    p_date DATE
)
RETURNS TABLE (
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        da.start_time,
        da.end_time,
        da.is_available
    FROM doctor_availability da
    WHERE da.doctor_id = p_doctor_id 
        AND da.date = p_date
        AND da.is_available = true
    ORDER BY da.start_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 8: Verification queries
-- ============================================================================

-- Check if the trigger function was created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'validate_appointment_booking';

-- Check if the triggers were created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND trigger_name IN (
        'validate_appointment_booking_trigger',
        'mark_slot_unavailable_after_booking_trigger',
        'mark_slot_available_after_cancellation_trigger'
    );

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Appointment validation fixes completed successfully!';
    RAISE NOTICE 'The following protections are now in place:';
    RAISE NOTICE '1. Database-level validation prevents booking on unavailable slots';
    RAISE NOTICE '2. Time slots are automatically marked unavailable after booking';
    RAISE NOTICE '3. Time slots are automatically marked available after cancellation';
    RAISE NOTICE '4. New function get_available_time_slots() for proper availability checking';
    RAISE NOTICE '';
    RAISE NOTICE 'Patients can no longer book appointments on unallocated time slots!';
END $$;
