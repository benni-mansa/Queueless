# Admin Setup and Usage Guide

## Overview
This guide will help you set up and use the admin functionality in the Hospital Queue Management System.

## ⚠️ Important: RLS Issue Fixed
**The infinite recursion error has been resolved by disabling RLS (Row Level Security) on all tables.** This allows the app to function properly during development and testing.

## Prerequisites
1. ✅ Database structure is set up (run `database-setup-no-rls.sql` or fix existing setup)
2. ✅ Supabase project is configured
3. ✅ App is running and accessible

## Quick Fix for Existing Database
If you're getting the "infinite recursion detected in policy" error:

1. **Run the comprehensive setup script (Recommended):**
   - Open `setup-database-complete.sql` in your Supabase SQL Editor
   - Execute the entire script
   - This handles all existing objects gracefully and sets up everything

2. **Alternative: Quick fix for RLS only:**
   - Open `fix-rls-issue.sql` in your Supabase SQL Editor
   - Execute the entire script
   - This will disable RLS and resolve the error

3. **For trigger conflicts:**
   - If you get "trigger already exists" errors, run `fix-existing-triggers.sql`
   - This handles existing triggers and recreates them properly

4. **Fresh start option:**
   - Use `database-setup-no-rls.sql` for a clean setup without RLS
   - This avoids any potential policy conflicts

## Setting Up Admin Access

### Option 1: Create Admin Account Through the App (Recommended)

1. **Launch the App**
   - Run your React Native app
   - Navigate to the Sign Up screen

2. **Create Admin Account**
   - Fill in all required fields
   - **Important**: Select "Admin" role from the role selection
   - Use a strong password
   - Complete the signup process

3. **Verify Account Creation**
   - Check your email for verification (if enabled)
   - Sign in with your admin credentials

### Option 2: Create Admin Account Through Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to Authentication > Users
   - Click "Add User"

2. **Create User Account**
   - Enter email and password
   - Set email confirmation to "Auto-confirm" for testing

3. **Create User Profile**
   - Go to SQL Editor
   - Run the following (replace with actual email):
   ```sql
   INSERT INTO users (id, name, phone, role) 
   SELECT id, 'Admin User', '+1234567890', 'admin'
   FROM auth.users 
   WHERE email = 'your-admin-email@example.com';
   ```

### Option 3: Use SQL Script

1. **Create User Account First**
   - Use the app or Supabase dashboard to create a user account

2. **Run Admin Creation Script**
   - Open `create-admin-account.sql` in Supabase SQL Editor
   - Replace `YOUR_ADMIN_USER_ID` with the actual UUID
   - Execute the script

## Admin Dashboard Features

### 1. **Dashboard Overview**
- **Statistics Cards**: View total doctors, patients, appointments, and pending appointments
- **Quick Actions**: Access key management functions
- **Recent Doctors**: See recently added doctors with quick edit access

### 2. **Doctor Management**
- Add new doctors to the system
- Edit existing doctor information
- Remove doctors from the system
- View all doctors and their specialties

### 3. **Availability Management**
- Set doctor schedules and working hours
- Configure appointment time slots
- Manage availability for specific dates
- Set buffer times between appointments

### 4. **System Configuration**
- Manage service categories
- Configure appointment types and durations
- Set system parameters

## Testing Admin Functionality

### 1. **Login Test**
```
Email: your-admin-email@example.com
Password: your-password
Role: admin
```

### 2. **Navigation Test**
- After login, you should see the admin tab navigation
- Verify you can access all admin screens
- Check that patient/doctor screens are not accessible

### 3. **Functionality Test**
- Create a test doctor account
- Set up availability for the doctor
- Create a test patient account
- Book an appointment
- Verify all admin functions work correctly

## Admin User Roles and Permissions

### **Admin Role**
- Full system access
- Can manage all users (doctors, patients, admins)
- Can configure system settings
- Can view all appointments and data
- Can manage doctor availability

### **Doctor Role**
- Limited to their own schedule
- Can view their appointments
- Can update their profile

### **Patient Role**
- Can book appointments
- Can view their own appointments
- Can update their profile

## Security Considerations

### 1. **Current Setup (Development)**
- **RLS is disabled** - all authenticated users can access all data
- **Application-level access control** is implemented through role-based navigation
- **Suitable for development and testing**

### 2. **Production Considerations**
- **Re-enable RLS** with carefully crafted policies
- **Implement proper database-level security**
- **Add API-level access control**
- **Consider implementing 2FA for admin accounts**

### 3. **Authentication**
- Use strong passwords for admin accounts
- Regular session management and logout functionality
- Monitor admin account usage

## Troubleshooting

### Common Issues

#### 1. **RLS Infinite Recursion Error (RESOLVED)**
```
ERROR: infinite recursion detected in policy for relation "users"
```
**Solution**: Run `fix-rls-issue.sql` to disable RLS

#### 2. **Admin Login Not Working**
- Verify the user account exists in `auth.users`
- Check that the user profile exists in `users` table
- Ensure the role is set to 'admin' (not 'Admin' or 'ADMIN')

#### 3. **Admin Dashboard Not Loading**
- Check browser console for errors
- Verify Supabase connection
- Check that RLS is disabled (if using the fix)

#### 4. **Role Not Updating**
- Clear app cache and restart
- Check if the user profile was updated in the database
- Verify the `useAuth` hook is working correctly

### Debug Queries

```sql
-- Check user authentication
SELECT * FROM auth.users WHERE email = 'your-email@example.com';

-- Check user profile
SELECT * FROM users WHERE id = 'user-uuid-here';

-- Check all admin users
SELECT * FROM users WHERE role = 'admin';

-- Check RLS status (should show false for all tables)
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'doctors', 'doctor_availability', 'appointments', 'service_categories', 'notifications');
```

## Best Practices

### 1. **Admin Account Management**
- Use dedicated admin emails (not personal emails)
- Implement strong password policies
- Regular password rotation
- Monitor admin account usage

### 2. **Data Management**
- Regular backups of important data
- Audit logs for admin actions
- Data retention policies
- Regular data cleanup

### 3. **User Experience**
- Clear navigation for admin users
- Intuitive interface design
- Helpful error messages
- Loading states for better UX

## Next Steps

After setting up admin access:

1. **Configure System Settings**
   - Set up service categories
   - Configure appointment durations
   - Set business hours

2. **Add Initial Data**
   - Create doctor accounts
   - Set up availability schedules
   - Add service categories

3. **Test End-to-End**
   - Complete appointment booking flow
   - Test admin management functions
   - Verify data consistency

4. **Train Staff**
   - Document admin procedures
   - Create user guides
   - Set up support processes

## Support

If you encounter issues:

1. **For RLS errors**: Run `fix-rls-issue.sql` immediately
2. Check the troubleshooting section above
3. Verify all prerequisites are met
4. Check Supabase logs for errors
5. Review the app console for JavaScript errors

For additional help, refer to:
- `setup-database-complete.sql` - Complete setup that handles all existing objects
- `fix-rls-issue.sql` - Quick fix for RLS infinite recursion issues
- `fix-existing-triggers.sql` - Fix for trigger conflicts
- `database-setup-no-rls.sql` - Clean setup without RLS
- `SETUP_DEMO_DATA.md` - For setting up test data
- `TASKS.md` - For project status and next steps
