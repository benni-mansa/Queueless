# Demo Data Setup Guide - Fixing Doctor Profile and Time Selection Issues

## Overview
This guide will help you resolve the critical issues where:
1. **Patients cannot see doctor names** - Doctor profiles are not displaying properly
2. **Patients cannot select available times** - Time selection is not working due to missing availability data

## Root Causes Identified

### Issue 1: Doctor Names Not Displaying
- **Problem**: The code was trying to access `doctor.user?.user_metadata?.name` which is incorrect
- **Solution**: Fixed to use `doctor.user?.name` from the `users` table
- **Status**: ✅ Fixed in code

### Issue 2: Time Selection Not Working
- **Problem**: No doctor availability data exists in the database
- **Solution**: Implemented automatic availability creation and improved time slot generation
- **Status**: ✅ Fixed in code

## Prerequisites
1. ✅ Database structure is set up (run `database-setup.sql`)
2. ✅ Supabase project is configured
3. ✅ Environment variables are set up

## Step-by-Step Setup

### Step 1: Create User Accounts
First, create user accounts through the app interface:

1. **Run your React Native app**
2. **Create accounts for:**
   - 5 doctors (different specialties)
   - 2 patients
   - 1 admin user

**Important**: Use realistic names like:
- Dr. Sarah Johnson (Cardiology)
- Dr. Michael Chen (Neurology)
- Dr. Emily Rodriguez (Pediatrics)
- Dr. David Thompson (Orthopedics)
- Dr. Lisa Wang (Dermatology)

### Step 2: Get Real User UUIDs
After creating users, get their actual UUIDs:

1. **In Supabase SQL Editor, run:**
```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

2. **Copy the UUIDs for each user**

### Step 3: Update Demo Data Script
1. **Open `demo-data-setup.sql`**
2. **Replace all placeholder UUIDs with real UUIDs from Step 2**
3. **Save the file**

### Step 4: Run Demo Data Script
1. **In Supabase SQL Editor, run the updated `demo-data-setup.sql`**
2. **This will create:**
   - User profiles in the `users` table
   - Doctor records in the `doctors` table
   - Availability data in the `doctor_availability` table
   - Sample appointments and notifications

### Step 5: Verify Data Creation
Run this query to verify data was created:

```sql
-- Check all tables have data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'Doctor Availability', COUNT(*) FROM doctor_availability
UNION ALL
SELECT 'Appointments', COUNT(*) FROM appointments;
```

**Expected Results:**
- Users: 8+ records
- Doctors: 5+ records
- Doctor Availability: 70+ records (5 doctors × 14 days)
- Appointments: 3+ records

## Testing the Fixes

### Test 1: Doctor Names Display
1. **Navigate to Book Appointment screen**
2. **Verify doctor names are visible:**
   - Should show "Dr. Sarah Johnson" instead of "Dr. Unknown"
   - Should show "Dr. Michael Chen" instead of "Dr. Unknown"
   - All doctor names should be properly displayed

### Test 2: Time Selection
1. **Select a doctor**
2. **Select a date (tomorrow or later)**
3. **Verify time slots appear:**
   - Should show available time slots from 9:00 AM to 5:00 PM
   - Time slots should be selectable
   - Each slot should be 30 minutes

### Test 3: Appointment Booking
1. **Complete the booking flow:**
   - Select doctor ✅
   - Select date ✅
   - Select time ✅
   - Book appointment ✅
2. **Verify appointment is created successfully**

## Troubleshooting

### Still No Doctor Names?
1. **Check the `users` table:**
```sql
SELECT u.id, u.name, u.role, d.specialty
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.role = 'doctor';
```

2. **Verify the join is working:**
```sql
SELECT d.*, u.name as doctor_name
FROM doctors d
JOIN users u ON d.user_id = u.id;
```

### Still No Time Slots?
1. **Check availability data:**
```sql
SELECT da.*, d.specialty, u.name as doctor_name
FROM doctor_availability da
JOIN doctors d ON da.doctor_id = d.id
JOIN users u ON d.user_id = u.id
WHERE da.date = CURRENT_DATE + INTERVAL '1 day'
ORDER BY da.start_time;
```

2. **Manually create availability if needed:**
```sql
-- Create availability for a specific doctor and date
INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, is_available)
VALUES 
  ('doctor-uuid-here', '2024-01-15', '09:00', '09:30', true),
  ('doctor-uuid-here', '2024-01-15', '09:30', '10:00', true),
  ('doctor-uuid-here', '2024-01-15', '10:00', '10:30', true);
```

### Database Connection Issues?
1. **Check environment variables**
2. **Verify Supabase credentials**
3. **Check network connectivity**

## Code Changes Made

### 1. Fixed Doctor Name Display
**Before:**
```typescript
Dr. {doctor.user?.user_metadata?.name || 'Unknown'}
```

**After:**
```typescript
Dr. {doctor.user?.name || 'Unknown'}
```

### 2. Improved Availability System
**Added automatic availability creation:**
- Creates default 30-minute slots from 9 AM to 5 PM
- Automatically generates availability for new dates
- Handles missing availability data gracefully

### 3. Enhanced Time Slot Generation
**Improved time slot logic:**
- Only shows actually available time slots
- Filters out unavailable slots
- Better error handling and logging

## Next Steps
After fixing these issues:

1. **Test the complete appointment booking flow**
2. **Verify doctor profiles display correctly**
3. **Test time selection for different dates**
4. **Create additional test data as needed**
5. **Move on to implementing advanced features**

## Support
If you encounter issues:

1. **Check the browser console for errors**
2. **Verify all database tables exist**
3. **Check that RLS policies are properly configured**
4. **Ensure all foreign key relationships are correct**

## Success Criteria
- ✅ Doctor names display correctly in all screens
- ✅ Time selection works for available dates
- ✅ Appointment booking completes successfully
- ✅ All screens show proper doctor information
