-- Fix availability slots: Convert 1-hour slots to 30-minute slots
-- Run this in Supabase SQL Editor to fix the time slot issue

-- First, let's see what we currently have
SELECT 
  id,
  doctor_id,
  date,
  start_time,
  end_time,
  is_available
FROM doctor_availability 
WHERE date = CURRENT_DATE + INTERVAL '1 day'
ORDER BY start_time;

-- Clear existing availability for tomorrow
DELETE FROM doctor_availability 
WHERE date = CURRENT_DATE + INTERVAL '1 day';

-- Create 30-minute slots from 9 AM to 5 PM
INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, is_available)
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '09:00'::time,
  '09:30'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '09:30'::time,
  '10:00'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '10:00'::time,
  '10:30'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '10:30'::time,
  '11:00'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '11:00'::time,
  '11:30'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '11:30'::time,
  '12:00'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '12:00'::time,
  '12:30'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '12:30'::time,
  '13:00'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '13:00'::time,
  '13:30'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '13:30'::time,
  '14:00'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '14:00'::time,
  '14:30'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '14:30'::time,
  '15:00'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '15:00'::time,
  '15:30'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '15:30'::time,
  '16:00'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '16:00'::time,
  '16:30'::time,
  true
FROM doctors d
UNION ALL
SELECT 
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '16:30'::time,
  '17:00'::time,
  true
FROM doctors d;

-- Verify the new 30-minute slots
SELECT 
  id,
  doctor_id,
  date,
  start_time,
  end_time,
  is_available,
  start_time::text as start_time_text
FROM doctor_availability 
WHERE date = CURRENT_DATE + INTERVAL '1 day'
ORDER BY start_time;

-- Count the slots to make sure we have the right number
-- Should be 16 slots (9:00, 9:30, 10:00, 10:30, ..., 16:30)
SELECT COUNT(*) as total_slots 
FROM doctor_availability 
WHERE date = CURRENT_DATE + INTERVAL '1 day';
