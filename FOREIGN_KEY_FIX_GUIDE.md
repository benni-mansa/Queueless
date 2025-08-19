# 🔧 Foreign Key Constraint Fix Guide

## 🚨 The Problem

You're experiencing this error during user signup:

```
insert or update on table "users" violates foreign key constraint "users_id_fkey"
Key (id)=(4ace0c53-7229-431c-aa88-ef6bd07ede1d) is not present in table "users".
```

### What's Happening

1. **Supabase Auth** creates a new user in the `auth.users` table
2. **Your app** tries to immediately insert a profile row into your `users` table
3. **Foreign key constraint** fails because the `auth.users` row isn't fully committed yet
4. **Result**: Signup fails with foreign key violation

## ✅ The Solution

We've implemented a **database trigger** that automatically creates user profiles when someone signs up. This eliminates the timing issue completely.

## 🚀 How to Implement

### Option 1: Complete Database Reset (Recommended for new projects)

1. **Run the complete setup script** in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of database-setup.sql
   ```

2. **This will**:
   - Drop all existing tables
   - Recreate them with proper structure
   - Add the automatic trigger
   - Set up all RLS policies

### Option 2: Add Trigger Only (For existing databases)

1. **Run the trigger-only script** in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of add-trigger-only.sql
   ```

2. **This will**:
   - Keep your existing data
   - Add only the trigger function and trigger
   - Fix the foreign key issue

## 🔍 How the Trigger Works

### The Trigger Function

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract user metadata from auth.users
    INSERT INTO public.users (id, name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### The Trigger

```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### What Happens

1. **User signs up** → Supabase creates row in `auth.users`
2. **Trigger fires** → Automatically creates row in `public.users`
3. **Both operations** happen in the same transaction
4. **No timing issues** → Foreign key constraint is always satisfied

## 📱 Code Changes Made

### 1. Simplified useAuth Hook

Your `signUp` function is now much simpler:

```typescript
const signUp = async (email: string, password: string, name: string, phone?: string, role: 'patient' | 'doctor' | 'admin' = 'patient') => {
  try {
    // Create Supabase auth user with metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, role }, // This metadata gets stored in auth.users
      },
    });
    
    if (error) throw error;

    // The database trigger will automatically create the user profile
    // No need to manually insert into the users table
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};
```

### 2. Metadata Storage

The user's `name`, `phone`, and `role` are stored in `auth.users.raw_user_meta_data` and automatically extracted by the trigger.

## 🧪 Testing the Fix

### 1. Run the SQL Script

Execute either `database-setup.sql` or `add-trigger-only.sql` in your Supabase SQL editor.

### 2. Verify Trigger Creation

Check that the trigger was created:

```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND trigger_name = 'on_auth_user_created';
```

### 3. Test User Signup

Try creating a new user account. You should see:
- ✅ No foreign key errors
- ✅ User profile automatically created
- ✅ Clean, simple signup process

## 🔒 Security Considerations

### SECURITY DEFINER

The trigger function uses `SECURITY DEFINER`, which means:
- It runs with the privileges of the function creator
- It can bypass RLS policies
- It's safe because it only inserts into the `users` table

### RLS Policies

Your existing RLS policies remain intact:
- Users can only see their own profiles
- Users can only update their own profiles
- The trigger doesn't affect these security rules

## 🚨 Troubleshooting

### Trigger Not Working?

1. **Check if trigger exists**:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **Check if function exists**:
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'handle_new_user';
   ```

3. **Verify permissions**:
   - Make sure you have `CREATE` permission on functions
   - Make sure you have `CREATE` permission on triggers

### Still Getting Foreign Key Errors?

1. **Check table structure**:
   ```sql
   \d users
   ```

2. **Verify foreign key constraint**:
   ```sql
   SELECT 
       tc.constraint_name,
       tc.table_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name
   FROM information_schema.table_constraints tc
   JOIN information_schema.key_column_usage kcu 
       ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage ccu 
       ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
       AND tc.table_name = 'users';
   ```

## 🎯 Benefits of This Solution

1. **✅ Eliminates foreign key errors** - No more timing issues
2. **✅ Automatic profile creation** - No manual database operations
3. **✅ Transaction safety** - Both operations happen atomically
4. **✅ Cleaner code** - Simpler signup logic
5. **✅ Better reliability** - No retry mechanisms needed
6. **✅ Maintains security** - RLS policies still work

## 🔄 Migration Path

### If You Have Existing Users

1. **Run the trigger-only script** first
2. **Test with new signups** to ensure it works
3. **For existing users**, you may need to manually create profiles if they're missing

### If Starting Fresh

1. **Use the complete database setup** script
2. **All new users** will automatically get profiles
3. **No manual intervention** needed

## 📞 Need Help?

If you encounter any issues:

1. **Check the Supabase logs** for detailed error messages
2. **Verify the trigger was created** using the verification queries
3. **Test with a simple signup** to isolate the issue
4. **Check your Supabase project settings** for any restrictions

---

**🎉 With this solution, your user signup process will be rock-solid and error-free!**
