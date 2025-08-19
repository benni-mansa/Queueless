# Fix Environment Variables Issue

## Problem
You're getting this error:
```
ERROR  ❌ [ENV] Environment variable SUPABASE_SERVICE_ROLE_KEY not found anywhere!
```

## Root Cause
The environment variable `SUPABASE_SERVICE_ROLE_KEY` is not being loaded properly from your `.env` file.

## Solutions

### Solution 1: Check Your .env File (Most Likely Fix)

1. **Verify .env file exists** in your project root (`queueless-app/` folder)
2. **Check variable name** - it should be exactly:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
   ```
3. **No spaces around =** - should be `KEY=value`, not `KEY = value`
4. **No quotes** - should be `KEY=value`, not `KEY="value"`

### Solution 2: Create/Update .env File

1. **Copy the example file**:
   ```bash
   cp config.env.example .env
   ```

2. **Edit .env file** and add your actual values:
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # App Configuration
   APP_NAME=Hospital Queue
   APP_VERSION=1.0.0
   APP_ENVIRONMENT=development
   ```

### Solution 3: Get Your Service Role Key

1. **Go to Supabase Dashboard**
2. **Navigate to Settings > API**
3. **Copy the "service_role" key** (not the anon key)
4. **Paste it in your .env file**

### Solution 4: Alternative Variable Names

If you prefer different variable names, you can modify `src/config/env.ts`:

```typescript
// Change this line:
serviceRoleKey: getOptionalEnvVar('SUPABASE_SERVICE_ROLE_KEY'),

// To match your .env file variable name, e.g.:
serviceRoleKey: getOptionalEnvVar('SUPABASE_SERVICE_KEY'),
// or
serviceRoleKey: getOptionalEnvVar('SERVICE_ROLE_KEY'),
```

## File Structure
Your project should look like this:
```
queueless-app/
├── .env                    ← Your environment variables (create this)
├── config.env.example      ← Example file (already exists)
├── src/
│   └── config/
│       └── env.ts         ← Environment configuration
└── ...
```

## Verification

After fixing, restart your app and check the console logs. You should see:
```
✅ [ENV] Environment variable SUPABASE_SERVICE_ROLE_KEY found in process.env
✅ [ENV] Service role key is available for admin operations
```

## Common Issues

1. **File not found**: Make sure `.env` is in the project root
2. **Wrong variable name**: Check for typos or different naming
3. **File permissions**: Ensure `.env` is readable
4. **Restart required**: Always restart your app after changing `.env`

## Next Steps

1. **Fix the .env file** using one of the solutions above
2. **Restart your React Native app**
3. **Check console logs** for successful environment loading
4. **Try creating a doctor again** - the admin permissions should now work

## Support

If you still have issues:
1. Check that `.env` file exists and has correct format
2. Verify variable names match exactly
3. Ensure no extra spaces or quotes in values
4. Restart the app completely
