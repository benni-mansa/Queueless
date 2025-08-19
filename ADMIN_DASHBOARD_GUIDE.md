# Admin Dashboard System Guide

## Overview
The Admin Dashboard System provides hospital administrators with comprehensive tools to manage doctors, set appointment availability, and oversee the entire hospital queue system. This system is designed to be intuitive and efficient for daily administrative tasks.

## Features

### 🏠 **Admin Dashboard**
- **Statistics Overview**: View total doctors, patients, appointments, and pending appointments
- **Quick Actions**: Easy access to common administrative tasks
- **Recent Doctors**: See the latest doctors added to the system
- **Real-time Updates**: Refresh data to see current system status

### 👨‍⚕️ **Doctor Management**
- **Add New Doctors**: Complete form with name, email, phone, specialty, experience, education, and bio
- **Edit Existing Doctors**: Update doctor information and details
- **Delete Doctors**: Remove doctors from the system (with confirmation)
- **Doctor List**: View all doctors with their specialties and contact information

### 📅 **Availability Management**
- **Weekly Schedule View**: See the current week's schedule at a glance
- **Time Slot Management**: Set available/unavailable time slots for each day
- **Doctor Selection**: Choose which doctor's schedule to manage
- **Quick Actions**: Make all slots available or clear all with one click
- **Visual Indicators**: Color-coded availability status

### 🔧 **System Administration**
- **Role-based Access**: Different interfaces for admins, doctors, and patients
- **User Management**: Oversee all users in the system
- **Service Categories**: Manage appointment types and durations
- **System Statistics**: Monitor system performance and usage

## How to Use

### 1. **Accessing the Admin Dashboard**
- Log in with an admin account
- The system automatically detects your role and shows the admin interface
- Navigate using the bottom tab bar with icons for each section

### 2. **Adding a New Doctor**
1. Go to **Doctor Management** tab
2. Tap the **+** button in the top right
3. Fill in the required fields:
   - **Name** (required): Doctor's full name
   - **Email** (required): Doctor's email address
   - **Phone**: Contact number
   - **Specialty** (required): Medical specialty
   - **Experience**: Years of experience
   - **Education**: Medical degrees
   - **Bio**: Brief description
4. Tap **Add Doctor**
5. The doctor will receive a temporary password via email

### 3. **Setting Doctor Availability**
1. Go to **Schedule** tab
2. Select a doctor from the horizontal scroll list
3. Tap on a working day (weekends are disabled by default)
4. In the modal, toggle individual time slots on/off
5. Use **Quick Actions** to make all slots available or clear all
6. Tap **Save Availability**

### 4. **Managing Existing Doctors**
1. Go to **Doctor Management** tab
2. Find the doctor in the list
3. Tap the **edit** button (pencil icon) to modify
4. Tap the **delete** button (trash icon) to remove
5. Confirm deletion when prompted

## Technical Details

### **Database Structure**
- **Users Table**: Basic user information and roles
- **Doctors Table**: Doctor-specific information linked to users
- **Doctor Availability Table**: Time slots and availability status
- **Appointments Table**: Patient appointments and status
- **Service Categories Table**: Appointment types and durations

### **API Endpoints**
- **GET /doctors**: Retrieve all doctors
- **POST /doctors**: Create new doctor
- **PUT /doctors/:id**: Update doctor information
- **DELETE /doctors/:id**: Remove doctor
- **POST /availability**: Set doctor availability
- **GET /availability**: Get availability for date range

### **Security Features**
- **Role-based Access Control**: Only admins can access these features
- **Input Validation**: All forms validate required fields
- **Confirmation Dialogs**: Destructive actions require confirmation
- **Audit Logging**: All admin actions are logged

## Best Practices

### **Doctor Management**
- Always verify email addresses before adding doctors
- Use descriptive specialties for better patient understanding
- Keep doctor information up to date
- Archive rather than delete when possible

### **Availability Management**
- Set availability at least one week in advance
- Consider doctor preferences and working hours
- Account for holidays and special events
- Regular review and updates of schedules

### **System Maintenance**
- Monitor system statistics regularly
- Review pending appointments daily
- Update service categories as needed
- Regular backup of important data

## Troubleshooting

### **Common Issues**

#### **Doctor Not Appearing**
- Check if the doctor was created successfully
- Verify the user role is set to 'doctor'
- Check for any database errors in the console

#### **Availability Not Saving**
- Ensure you're logged in as an admin
- Check if the selected date is valid
- Verify the doctor ID is correct
- Check console for error messages

#### **Permission Errors**
- Confirm your user account has admin role
- Check if the service role key is configured
- Verify database permissions are set correctly

### **Error Messages**
- **"Doctor not found"**: The doctor ID is invalid or the doctor was deleted
- **"Failed to create user"**: Email might already exist or password requirements not met
- **"Invalid date format"**: Date string is not in YYYY-MM-DD format
- **"Permission denied"**: User doesn't have admin privileges

## Future Enhancements

### **Planned Features**
- **Bulk Operations**: Add multiple doctors or set availability for multiple dates
- **Advanced Scheduling**: Recurring schedules and template management
- **Reporting**: Detailed analytics and performance metrics
- **Integration**: Connect with external calendar systems
- **Notifications**: Alert admins about system events

### **Mobile Optimizations**
- **Offline Support**: Work without internet connection
- **Push Notifications**: Real-time updates and alerts
- **Touch Gestures**: Swipe and pinch for better mobile experience
- **Responsive Design**: Optimized for all screen sizes

## Support

### **Getting Help**
1. Check the console logs for detailed error information
2. Verify your environment variables are set correctly
3. Ensure your Supabase project is active and accessible
4. Check that your database tables are properly set up

### **Contact Information**
- **Technical Support**: Check the project documentation
- **Feature Requests**: Submit through the project repository
- **Bug Reports**: Include console logs and steps to reproduce

---

**Note**: This admin dashboard system is designed to be secure, efficient, and user-friendly. Always follow security best practices and regularly review system access and permissions.
