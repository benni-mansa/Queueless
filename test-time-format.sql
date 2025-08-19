-- Test script to check time format in doctor_availability table
-- Run this in Supabase SQL Editor to see the exact format

-- Check the structure of the doctor_availability table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'doctor_availability' 
ORDER BY ordinal_position;

-- Check sample data with detailed time format
SELECT 
  id,
  doctor_id,
  date,
  start_time,
  end_time,
  is_available,
  pg_typeof(start_time) as start_time_type,
  pg_typeof(end_time) as end_time_type,
  start_time::text as start_time_text,
  end_time::text as end_time_text
FROM doctor_availability 
LIMIT 5;

-- Check if there are any availability records
SELECT COUNT(*) as total_records FROM doctor_availability;

-- Check availability for a specific doctor and date
SELECT 
  da.*,
  d.specialty,
  u.name as doctor_name
FROM doctor_availability da
JOIN doctors d ON da.doctor_id = d.id
JOIN users u ON d.user_id = u.id
WHERE da.date = CURRENT_DATE + INTERVAL '1 day'
ORDER BY da.start_time
LIMIT 10;
