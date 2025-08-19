-- ============================================================================
-- HOSPITAL QUEUE APP - COMPLETE DATABASE SETUP
-- ============================================================================
-- This file contains all necessary database setup for the Hospital Queue app
-- Run this file in your Supabase SQL editor to set up the complete database

-- ============================================================================
-- STEP 1: Drop existing tables and functions (if they exist)
-- ============================================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- STEP 2: Create the core tables
-- ============================================================================

-- Create users table for profile information
-- This table extends the auth.users table with additional profile data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('admin', 'doctor', 'patient')) NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    slot_duration INTEGER DEFAULT 30, -- in minutes
    buffer_time INTEGER DEFAULT 15, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    specialty TEXT NOT NULL,
    experience TEXT,
    education TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctor availability table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    slot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('appointment_confirmation', 'reminder', 'cancellation', 'update')) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_date ON doctor_availability(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_date ON doctor_availability(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_slot_time ON appointments(slot_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- STEP 4: Create updated_at trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- STEP 5: Create triggers for updated_at functionality
-- ============================================================================

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at 
    BEFORE UPDATE ON doctors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_availability_updated_at 
    BEFORE UPDATE ON doctor_availability 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at 
    BEFORE UPDATE ON service_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: Create automatic user profile creation trigger
-- ============================================================================

-- Function to automatically create user profile when auth user is created
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

-- Trigger that fires when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STEP 7: Insert default service categories
-- ============================================================================

INSERT INTO service_categories (name, description, slot_duration, buffer_time) VALUES
('General Consultation', 'Basic medical consultation and check-up', 30, 15),
('Specialist Consultation', 'Specialized medical consultation', 45, 20),
('Emergency Care', 'Urgent medical attention', 60, 10),
('Follow-up Visit', 'Post-treatment follow-up consultation', 20, 10),
('Preventive Care', 'Routine health check and prevention', 30, 15)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 8: Create helper functions
-- ============================================================================

-- Function to get available time slots for a doctor on a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
    p_doctor_id UUID,
    p_date DATE,
    p_slot_duration INTEGER DEFAULT 30
)
RETURNS TABLE (
    slot_time TIMESTAMP WITH TIME ZONE,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        generate_series(
            p_date + '09:00:00'::time,
            p_date + '17:00:00'::time,
            (p_slot_duration || ' minutes')::interval
        )::timestamp with time zone as slot_time,
        true as is_available
    EXCEPT
    SELECT 
        da.start_time::timestamp with time zone,
        da.is_available
    FROM doctor_availability da
    WHERE da.doctor_id = p_doctor_id 
        AND da.date = p_date
        AND da.is_available = false;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a time slot is available
CREATE OR REPLACE FUNCTION is_slot_available(
    p_doctor_id UUID,
    p_slot_time TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
DECLARE
    slot_date DATE;
    slot_time TIME;
    conflicting_appointment BOOLEAN;
    conflicting_availability BOOLEAN;
BEGIN
    slot_date := p_slot_time::date;
    slot_time := p_slot_time::time;
    
    -- Check for conflicting appointments
    SELECT EXISTS(
        SELECT 1 FROM appointments 
        WHERE doctor_id = p_doctor_id 
            AND slot_time = p_slot_time
            AND status NOT IN ('cancelled', 'no_show')
    ) INTO conflicting_appointment;
    
    -- Check for conflicting availability
    SELECT EXISTS(
        SELECT 1 FROM doctor_availability 
        WHERE doctor_id = p_doctor_id 
            AND date = slot_date 
            AND start_time <= slot_time 
            AND end_time > slot_time
            AND is_available = false
    ) INTO conflicting_availability;
    
    RETURN NOT (conflicting_appointment OR conflicting_availability);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 9: Grant necessary permissions
-- ============================================================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can view service categories
CREATE POLICY "Anyone can view service categories" ON service_categories
    FOR SELECT USING (true);

-- Doctors can view and manage their own availability
CREATE POLICY "Doctors can view their own availability" ON doctor_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE doctors.id = doctor_availability.doctor_id 
            AND doctors.user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can manage their own availability" ON doctor_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE doctors.id = doctor_availability.doctor_id 
            AND doctors.user_id = auth.uid()
        )
    );

-- Users can view doctors
CREATE POLICY "Anyone can view doctors" ON doctors
    FOR SELECT USING (true);

-- Users can view appointments they're involved in
CREATE POLICY "Users can view their appointments" ON appointments
    FOR SELECT USING (
        patient_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE doctors.id = appointments.doctor_id 
            AND doctors.user_id = auth.uid()
        )
    );

-- Users can create appointments
CREATE POLICY "Authenticated users can create appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own appointments
CREATE POLICY "Users can update their appointments" ON appointments
    FOR UPDATE USING (
        patient_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE doctors.id = appointments.doctor_id 
            AND doctors.user_id = auth.uid()
        )
    );

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- STEP 10: Insert sample data (optional)
-- ============================================================================

-- Uncomment the following lines if you want to insert sample data
-- Note: You'll need to create actual user accounts first through the app

/*
-- Insert sample service categories (already done above)
-- Insert sample users (create through app signup)
-- Insert sample doctors (create through app)
-- Insert sample appointments (create through app)
*/

-- ============================================================================
-- STEP 11: Verification queries
-- ============================================================================

-- Verify all tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'doctors', 'doctor_availability', 'appointments', 'service_categories', 'notifications')
ORDER BY table_name;

-- Verify foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- Verify the trigger function was created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'handle_new_user';

-- Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
    AND trigger_name = 'on_auth_user_created';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'All tables, indexes, triggers, and policies have been created.';
    RAISE NOTICE 'The automatic user profile creation trigger is now active.';
    RAISE NOTICE 'You can now use the Hospital Queue app without foreign key errors.';
END $$;
