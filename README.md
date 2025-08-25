# Queueless

Queueless is a Hospital Queue Management Mobile App designed to eliminate physical queues in hospitals by providing a digital appointment booking and management system. The app helps both patients and hospital staff reduce wait times and improve the overall healthcare experience.

## Features

- **Digital Appointment Booking:** Patients can book, reschedule, and cancel appointments directly from their mobile device.
- **Real-Time Updates:** Receive real-time notifications on appointment status, queue positions, and doctor availability.
- **Queue Management:** Efficiently manages patient flow without physical lines.
- **Doctor & Staff Tools:** Optimizes workflow and provides scheduling tools for hospital staff.
- **Secure Authentication:** Uses Supabase Auth with JWT and Row Level Security for secure access.
- **Notifications:** Push notifications for appointments and status changes.
- **Responsive Design:** Clean, accessible, and user-friendly interface built with React Native and Expo.
- **Offline Support:** Caching and local storage for improved performance and usability.
- **API Integration:** RESTful endpoints for authentication, appointments, doctors, and notifications.

## Technology Stack

- **Frontend:** React Native (Expo)
- **Backend:** Supabase (PostgreSQL, Real-time, Auth)
- **State Management:** React Context + Hooks
- **Navigation:** React Navigation v6
- **Styling:** React Native StyleSheet
- **Notifications:** Expo Notifications
- **Language:** TypeScript

## Quick Start

```bash
npm install
cp .env.example .env   # or copy manually on Windows
npm start
```

## Environment Variables

Set the following in your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY= (optional, do not include in public builds)
```

See `src/config/env.ts` for loader/validator logic.

## Project Structure

```
src/
  components/  screens/  navigation/  services/  config/  hooks/  types/
```

## Scripts

- `npm start` – Start Expo
- `npm run android` – Android emulator
- `npm run ios` – iOS simulator (macOS)
- `npm run web` – Web preview

## Supabase Setup

Run the schema in `database-setup.sql` inside your Supabase project. Then set environment variables, restart the dev server, and test authentication and booking flows.

## Documentation

- For detailed UI/UX and technical design, see `DESIGN.md`.
- For requirements and business goals, see `REQUIREMENTS.md`.
- For task breakdown and progress, see `TASKS.md`.

## License

[Specify your license here]

---

> Reduce hospital wait times. Eliminate physical queues. Improve patient and staff experience with Queueless.
