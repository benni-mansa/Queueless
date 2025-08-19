# Setting Up Demo Data

## Overview
This guide will help you set up demo data for the Hospital Queue Management System after you have created user accounts in Supabase.

## Prerequisites
1. ✅ Database structure is set up (run `database-setup.sql`)
2. ✅ Supabase project is configured
3. ✅ User accounts are created through the app or Supabase dashboard

## Step-by-Step Process

### Step 1: Create User Accounts
First, you need to create user accounts through one of these methods:

**Option A: Through the App Interface**
1. Run your React Native app
2. Use the signup functionality to create accounts for:
   - 5 doctors (different specialties)
   - 2 patients
   - 1 admin user

**Option B: Through Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User" and create accounts manually
4. Note down the email addresses you use

### Step 2: Get User UUIDs
Once you have user accounts, you need to get their UUIDs:

1. In your Supabase SQL editor, run:
```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

2. Copy the UUIDs for each user you want to use in demo data

### Step 3: Create Demo Data
You have two options:

**Option A: Use the Function (Recommended)**
```sql
-- Replace the UUIDs with actual values from Step 2
SELECT create_demo_data_with_real_users(
    'doctor-1-uuid-here',
    'doctor-2-uuid-here', 
    'doctor-3-uuid-here',
    'doctor-4-uuid-here',
    'doctor-5-uuid-here',
    'patient-1-uuid-here',
    'patient-2-uuid-here',
    'admin-uuid-here'
);
```

**Option B: Manual Insert**
1. Open `demo-data.sql`
2. Replace all placeholder UUIDs with real UUIDs from Step 2
3. Run the script

### Step 4: Verify Demo Data
Check that the data was created successfully:

```sql
-- Check users
SELECT * FROM users;

-- Check doctors
SELECT d.*, u.name, u.role 
FROM doctors d 
JOIN users u ON d.user_id = u.id;

-- Check availability
SELECT da.*, d.specialty, u.name as doctor_name
FROM doctor_availability da
JOIN doctors d ON da.doctor_id = d.id
JOIN users u ON d.user_id = u.id
LIMIT 10;

-- Check service categories
SELECT * FROM service_categories;
```

## Troubleshooting

### Foreign Key Constraint Error
If you get the error:
```
ERROR: insert or update on table "doctors" violates foreign key constraint "doctors_user_id_fkey"
```

This means the UUIDs you're using don't exist in the `auth.users` table. Make sure to:
1. Create user accounts first
2. Use the correct UUIDs from `auth.users`
3. Don't use placeholder UUIDs like `00000000-0000-0000-0000-000000000001`

### No Users Found
If the query `SELECT * FROM auth.users` returns no results:
1. Make sure you're in the correct Supabase project
2. Verify that user accounts were actually created
3. Check if you're in the right database schema

## Sample User Creation Commands

If you want to create users programmatically, you can use the Supabase client in your app:

```typescript
// Example: Creating a doctor account
const { data, error } = await supabase.auth.signUp({
  email: 'doctor1@hospital.com',
  password: 'password123'
});

if (data.user) {
  // Insert into users table
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      name: 'Dr. Sarah Johnson',
      phone: '+1234567890',
      role: 'doctor'
    });
}
```

## Next Steps
After setting up demo data:
1. Test the appointment booking functionality
2. Verify doctor availability is working
3. Test the admin dashboard
4. Create additional test data as needed

## Support
If you encounter issues:
1. Check the Supabase logs for errors
2. Verify all foreign key relationships
3. Ensure RLS policies are properly configured
4. Check that all required tables exist
