import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  name?: string;
  phone?: string;
  role?: 'patient' | 'doctor' | 'receptionist' | 'admin';
  dateOfBirth?: string;
  address?: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  user: User;
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  service_type?: string;
  notes?: string;
  patient: User;
  doctor: Doctor;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  slot_duration: number; // in minutes
  buffer_time: number; // in minutes
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment_confirmation' | 'reminder' | 'cancellation' | 'update';
  is_read: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}
