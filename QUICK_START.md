# Quick Start Guide - Hospital Queue App

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Update `app.config.js` with your credentials:
   ```javascript
   extra: {
     supabaseUrl: "https://your-project.supabase.co",
     supabaseAnonKey: "your-anon-key-here"
   }
   ```

### 3. Set Up Database
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the `database-setup.sql` script
4. (Optional) Run the `demo-data.sql` script for sample data

### 4. Start the App
```bash
npm start
```

### 5. Test the App
- Use Expo Go app on your phone to scan the QR code
- Or press `w` for web, `a` for Android, `i` for iOS

## 🔧 Quick Configuration

### Environment Variables
The app automatically reads from `app.config.js`. No `.env` file needed!

### Database Tables
All tables are created automatically with proper relationships and security policies.

## 📱 App Features Ready to Use

✅ **Authentication System**
- User registration and login
- Secure password handling
- Session management

✅ **Appointment Booking**
- Doctor selection
- Date and time slot picking
- Real-time availability

✅ **User Dashboard**
- Appointment overview
- Quick statistics
- Profile management

✅ **Navigation**
- Bottom tab navigation
- Stack navigation for auth flow
- Proper screen routing

## 🐛 Troubleshooting

### Common Issues

**"Supabase connection failed"**
- Check your URL and anon key in `app.config.js`
- Ensure your Supabase project is active

**"Tables not found"**
- Run the `database-setup.sql` script in Supabase SQL Editor
- Check that all tables were created successfully

**"Navigation not working"**
- Ensure all dependencies are installed: `npm install`
- Check that all screen components are properly exported

### Testing the App

1. **Create a test account:**
   - Open the app
   - Go to "Sign Up"
   - Use a real email (verification required)

2. **Test appointment booking:**
   - After login, tap "Book Appointment"
   - Select a doctor, date, and time
   - Confirm the booking

3. **View appointments:**
   - Check the Dashboard for upcoming appointments
   - Go to "My Appointments" for full list

## 🚀 Next Steps

### For Development
- Customize the UI colors and branding
- Add more appointment types
- Implement push notifications

### For Production
- Set up proper error monitoring (Sentry)
- Configure production Supabase instance
- Set up CI/CD pipeline

### For Hospital Staff
- Create admin dashboard
- Add doctor availability management
- Implement queue management system

## 📞 Need Help?

- Check the main `README.md` for detailed documentation
- Review the database schema in `database-setup.sql`
- All code is well-commented and follows React Native best practices

---

**Happy Coding! 🎉**
Your Hospital Queue Management App is ready to use!
