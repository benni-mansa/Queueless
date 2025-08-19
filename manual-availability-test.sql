-- Manual test to create availability data and verify time format
-- Run this in Supabase SQL Editor

-- First, let's check if we have any doctors
SELECT id, specialty FROM doctors LIMIT 5;

-- Check if we have any availability data
SELECT COUNT(*) as total_availability FROM doctor_availability;

-- Manually create availability for a doctor (replace doctor_id with actual UUID)
-- This will help us test the time format
INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, is_available)
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '09:00'::time,
  '09:30'::time,
  true
FROM doctors d
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert more time slots
INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, is_available)
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '09:30'::time,
  '10:00'::time,
  true
FROM doctors d
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, is_available)
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '10:00'::time,
  '10:30'::time,
  true
FROM doctors d
LIMIT 1
ON CONFLICT DO NOTHING;

-- Now check what we created
SELECT 
  id,
  doctor_id,
  date,
  start_time,
  end_time,
  is_available,
  pg_typeof(start_time) as start_time_type,
  start_time::text as start_time_text
FROM doctor_availability 
WHERE date = CURRENT_DATE + INTERVAL '1 day'
ORDER BY start_time;

-- Check the exact format being returned
SELECT 
  'start_time' as field,
  start_time,
  pg_typeof(start_time) as type,
  start_time::text as text_value,
  length(start_time::text) as length
FROM doctor_availability 
WHERE date = CURRENT_DATE + INTERVAL '1 day'
LIMIT 1;
