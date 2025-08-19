# Hospital Queue Management Mobile App

A React Native mobile application designed to reduce hospital wait times and physical queues by providing an efficient appointment booking system.

## Features

### Patient Features
- **User Authentication**: Secure sign-up and sign-in with email/password
- **Dashboard**: Overview of upcoming appointments and quick stats
- **Book Appointments**: Select doctors, dates, and time slots
- **Manage Appointments**: View, cancel, and track appointment history
- **Profile Management**: User profile and preferences

### Hospital Staff Features
- **Doctor Management**: View and manage doctor availability
- **Queue Overview**: Real-time view of daily appointments
- **Status Updates**: Mark patients as arrived, delayed, or no-show

## Technology Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Database, Authentication, Real-time)
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Hooks with Context

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd queueless-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Create the following database tables (see Database Schema below)

4. **Configure environment variables**
   - Create an `app.config.js` file in the root directory:
   ```javascript
   export default {
     expo: {
       name: "Hospital Queue",
       slug: "hospital-queue",
       version: "1.0.0",
       orientation: "portrait",
       icon: "./assets/icon.png",
       userInterfaceStyle: "light",
       splash: {
         image: "./assets/splash.png",
         resizeMode: "contain",
         backgroundColor: "#ffffff"
       },
       extra: {
         supabaseUrl: "YOUR_SUPABASE_URL",
         supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY"
       }
     }
   };
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

## Database Schema

### Tables

#### users (managed by Supabase Auth)
- `id`: UUID (primary key)
- `email`: String
- `created_at`: Timestamp
- `user_metadata`: JSON (name, phone, role)

#### doctors
- `id`: UUID (primary key)
- `user_id`: UUID (references users.id)
- `specialty`: String

#### doctor_availability
- `id`: UUID (primary key)
- `doctor_id`: UUID (references doctors.id)
- `date`: Date
- `start_time`: Time
- `end_time`: Time
- `is_available`: Boolean

#### appointments
- `id`: UUID (primary key)
- `patient_id`: UUID (references users.id)
- `doctor_id`: UUID (references doctors.id)
- `slot_time`: Timestamp
- `status`: Enum ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
- `created_at`: Timestamp

#### service_categories
- `id`: UUID (primary key)
- `name`: String
- `description`: String
- `slot_duration`: Integer (minutes)
- `buffer_time`: Integer (minutes)

#### notifications
- `id`: UUID (primary key)
- `user_id`: UUID (references users.id)
- `title`: String
- `message`: String
- `type`: Enum ('appointment_confirmation', 'reminder', 'cancellation', 'update')
- `is_read`: Boolean
- `created_at`: Timestamp

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── BookAppointmentScreen.tsx
│   ├── MyAppointmentsScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── services/           # API and external services
│   ├── supabase.ts
│   └── appointmentService.ts
├── hooks/              # Custom React hooks
│   └── useAuth.ts
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
```

## Key Features Implementation

### Authentication
- Uses Supabase Auth for secure user authentication
- Supports email/password login
- Automatic session management

### Appointment Booking
- Doctor selection with specialties
- Date and time slot selection
- Real-time availability checking
- Appointment confirmation

### Real-time Updates
- Supabase Realtime subscriptions for live data
- Instant updates when appointments change
- Push notifications (Expo Notifications)

## Running the App

### Development
```bash
npm start
```

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web
```bash
npm run web
```

## Testing

```bash
npm test
```

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@hospitalqueue.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## Roadmap

### Version 1.1
- [ ] Push notifications
- [ ] Offline support
- [ ] Multi-language support

### Version 1.2
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Integration with hospital systems

### Version 2.0
- [ ] Video consultations
- [ ] Prescription management
- [ ] Payment integration
