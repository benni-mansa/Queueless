# Database Setup Guide

## Prerequisites
1. A Supabase project created
2. Access to the Supabase SQL Editor

## Steps to Set Up Database

### 1. Run the Database Setup Script
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `database-setup.sql`
5. Click **Run** to execute the script

### 2. Verify Tables Created
After running the script, you should see these tables in your **Table Editor**:
- `users` - User profile information
- `doctors` - Doctor records
- `doctor_availability` - Doctor schedule availability
- `appointments` - Patient appointments
- `service_categories` - Medical service types
- `notifications` - User notifications

### 3. Check RLS Policies
In the **Authentication > Policies** section, verify that Row Level Security is enabled for all tables.

### 4. Test the Setup
The script includes sample data for service categories. You should see:
- General Consultation
- Specialist Consultation  
- Emergency

## Troubleshooting

### Common Issues:
1. **Permission Denied**: Ensure you're using the correct database role
2. **Table Already Exists**: The script uses `CREATE TABLE IF NOT EXISTS` so this shouldn't be an issue
3. **Foreign Key Errors**: Make sure the `auth.users` table exists (it's managed by Supabase)

### If You Need to Reset:
1. Drop all tables manually in the SQL Editor
2. Re-run the setup script

## Next Steps
After database setup:
1. Update your `.env` file with Supabase credentials
2. Test the app to ensure database connections work
3. Create your first admin user through the app

## Support
If you encounter issues, check the Supabase logs in the **Logs** section of your dashboard.
