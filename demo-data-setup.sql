-- ============================================================================
-- HOSPITAL QUEUE APP - DEMO DATA SETUP
-- ============================================================================
-- This file creates sample data for testing the Hospital Queue app
-- Run this after setting up the database structure

-- ============================================================================
-- STEP 1: Create sample users (replace with actual auth.users IDs)
-- ============================================================================

-- Note: You need to create these users through the app or Supabase dashboard first
-- Then replace the UUIDs below with the actual UUIDs from auth.users

-- Sample user data (replace UUIDs with actual values)
INSERT INTO users (id, name, phone, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dr. Sarah Johnson', '+1234567890', 'doctor'),
  ('00000000-0000-0000-0000-000000000002', 'Dr. Michael Chen', '+1234567891', 'doctor'),
  ('00000000-0000-0000-0000-000000000003', 'Dr. Emily Rodriguez', '+1234567892', 'doctor'),
  ('00000000-0000-0000-0000-000000000004', 'Dr. David Thompson', '+1234567893', 'doctor'),
  ('00000000-0000-0000-0000-000000000005', 'Dr. Lisa Wang', '+1234567894', 'doctor'),
  ('00000000-0000-0000-0000-000000000006', 'John Smith', '+1234567895', 'patient'),
  ('00000000-0000-0000-0000-000000000007', 'Maria Garcia', '+1234567896', 'patient'),
  ('00000000-0000-0000-0000-000000000008', 'Admin User', '+1234567897', 'admin')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Create sample doctors
-- ============================================================================

INSERT INTO doctors (id, user_id, specialty, experience, education, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Cardiology', '15 years', 'Harvard Medical School', 'Experienced cardiologist specializing in heart disease prevention and treatment.'),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000002', 'Neurology', '12 years', 'Stanford Medical School', 'Board-certified neurologist with expertise in stroke treatment and neurological disorders.'),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000003', 'Pediatrics', '8 years', 'UCLA Medical School', 'Pediatrician dedicated to providing comprehensive care for children of all ages.'),
  ('11111111-1111-1111-1111-111111111114', '00000000-0000-0000-0000-000000000004', 'Orthopedics', '20 years', 'Johns Hopkins Medical School', 'Orthopedic surgeon specializing in joint replacement and sports medicine.'),
  ('11111111-1111-1111-1111-111111111115', '00000000-0000-0000-0000-000000000005', 'Dermatology', '10 years', 'Yale Medical School', 'Dermatologist with expertise in skin cancer detection and cosmetic procedures.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: Create sample service categories
-- ============================================================================

INSERT INTO service_categories (id, name, description, slot_duration, buffer_time) VALUES
  ('22222222-2222-2222-2222-222222222221', 'General Consultation', 'Standard medical consultation', 30, 15),
  ('22222222-2222-2222-2222-222222222222', 'Specialist Consultation', 'Specialized medical consultation', 45, 15),
  ('22222222-2222-2222-2222-222222222223', 'Follow-up Visit', 'Follow-up appointment', 20, 10),
  ('22222222-2222-2222-2222-222222222224', 'Emergency Consultation', 'Urgent medical consultation', 60, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Create sample doctor availability for the next 14 days
-- ===========================================================================-

-- Function to create availability for a specific doctor and date
CREATE OR REPLACE FUNCTION create_doctor_availability(doctor_uuid UUID, target_date DATE)
RETURNS VOID AS $$
DECLARE
  start_hour INTEGER := 9;
  end_hour INTEGER := 17;
  interval_minutes INTEGER := 30;
  current_hour INTEGER;
  current_minute INTEGER;
  start_time TIME;
  end_time TIME;
BEGIN
  -- Clear existing availability for this doctor and date
  DELETE FROM doctor_availability WHERE doctor_id = doctor_uuid AND date = target_date;
  
  -- Create 30-minute slots from 9 AM to 5 PM
  FOR current_hour IN start_hour..(end_hour - 1) LOOP
    FOR current_minute IN 0..30 BY interval_minutes LOOP
      start_time := (current_hour || ':' || LPAD(current_minute::TEXT, 2, '0'))::TIME;
      end_time := (current_hour || ':' || LPAD((current_minute + interval_minutes)::TEXT, 2, '0'))::TIME;
      
      -- Adjust end time for the last slot of each hour
      IF current_minute = 30 THEN
        end_time := ((current_hour + 1) || ':00')::TIME;
      END IF;
      
      INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, is_available)
      VALUES (doctor_uuid, target_date, start_time, end_time, true);
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create availability for all doctors for the next 14 days
DO $$
DECLARE
  doctor_record RECORD;
  current_date DATE := CURRENT_DATE;
  i INTEGER;
BEGIN
  -- Loop through all doctors
  FOR doctor_record IN SELECT id FROM doctors LOOP
    -- Create availability for the next 14 days
    FOR i IN 1..14 LOOP
      PERFORM create_doctor_availability(doctor_record.id, current_date + i);
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 5: Create sample appointments
-- ============================================================================

-- Create a few sample appointments
INSERT INTO appointments (id, patient_id, doctor_id, slot_time, status) VALUES
  ('33333333-3333-3333-3333-333333333331', '00000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10:00:00'), 'scheduled'),
  ('33333333-3333-3333-3333-333333333332', '00000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111112', (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '14:00:00'), 'scheduled'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111113', (CURRENT_DATE + INTERVAL '3 days' + INTERVAL '11:30:00'), 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 6: Create sample notifications
-- ============================================================================

INSERT INTO notifications (id, user_id, title, message, type) VALUES
  ('44444444-4444-4444-4444-444444444441', '00000000-0000-0000-0000-000000000006', 'Appointment Confirmed', 'Your appointment with Dr. Sarah Johnson has been confirmed for tomorrow at 10:00 AM.', 'appointment_confirmation'),
  ('44444444-4444-4444-4444-444444444442', '00000000-0000-0000-0000-000000000007', 'Appointment Reminder', 'Reminder: You have an appointment with Dr. Michael Chen tomorrow at 2:00 PM.', 'reminder')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 7: Verify the data
-- ============================================================================

-- Check users
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'Service Categories', COUNT(*) FROM service_categories
UNION ALL
SELECT 'Doctor Availability', COUNT(*) FROM doctor_availability
UNION ALL
SELECT 'Appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;

-- Check doctor availability for tomorrow
SELECT 
  d.specialty,
  u.name as doctor_name,
  da.date,
  da.start_time,
  da.end_time,
  da.is_available
FROM doctor_availability da
JOIN doctors d ON da.doctor_id = d.id
JOIN users u ON d.user_id = u.id
WHERE da.date = CURRENT_DATE + INTERVAL '1 day'
ORDER BY d.specialty, da.start_time
LIMIT 20;
