import { supabase } from './supabase';
import { Appointment, Doctor, DoctorAvailability } from '../types';

export const appointmentService = {
  // Get all doctors
  async getDoctors(): Promise<Doctor[]> {
    try {
      console.log('Attempting to fetch doctors from Supabase...');
      
      // First, let's check what's in the doctors table
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*');
      
      if (doctorsError) {
        console.error('Error fetching doctors table:', doctorsError);
        throw doctorsError;
      }
      
      console.log('Raw doctors data:', doctorsData);
      
      // Now fetch with user join - try different approaches
      let data: any = null;
      let error: any = null;
      
      // Try approach 1: Simple join
      const result1 = await supabase
        .from('doctors')
        .select(`
          *,
          user:users(
            id,
            name,
            phone,
            role,
            created_at
          )
        `);
      
      if (result1.error) {
        console.log('Approach 1 failed, trying approach 2...');
        
        // Try approach 2: Explicit foreign key
        const result2 = await supabase
          .from('doctors')
          .select(`
            *,
            user:users!doctors_user_id_fkey(
              id,
              name,
              phone,
              role,
              created_at
            )
          `);
        
        if (result2.error) {
          console.log('Approach 2 failed, trying approach 3...');
          
          // Try approach 3: Manual join
          const result3 = await supabase
            .from('doctors')
            .select('*');
          
          if (result3.error) {
            throw result3.error;
          }
          
          // Fetch users separately
          const usersResult = await supabase
            .from('users')
            .select('*')
            .in('id', result3.data.map(d => d.user_id));
          
          if (usersResult.error) {
            throw usersResult.error;
          }
          
          // Manually join
          data = result3.data.map(doctor => ({
            ...doctor,
            user: usersResult.data.find(u => u.id === doctor.user_id) || null
          }));
          error = null;
        } else {
          data = result2.data;
          error = result2.error;
        }
      } else {
        data = result1.data;
        error = result1.error;
      }
      
      if (error) {
        console.error('Supabase error fetching doctors with users:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Fallback: fetch doctors and users separately
        console.log('Falling back to separate queries...');
        const doctors = await supabase.from('doctors').select('*');
        const users = await supabase.from('users').select('*');
        
        if (doctors.error || users.error) {
          throw doctors.error || users.error;
        }
        
        // Manually join the data
        const joinedDoctors = doctors.data?.map(doctor => {
          const user = users.data?.find(u => u.id === doctor.user_id);
          return {
            ...doctor,
            user: user || null
          };
        }) || [];
        
        console.log('Manually joined doctors data:', joinedDoctors);
        return joinedDoctors;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} doctors with users`);
      console.log('Doctor data sample:', data?.[0]);
      console.log('Full doctor data structure:', JSON.stringify(data?.[0], null, 2));
      return data || [];
    } catch (error) {
      console.error('Error fetching doctors:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        supabaseClient: !!supabase
      });
      return [];
    }
  },

  // Get doctor availability for a specific date
  async getDoctorAvailability(doctorId: string, date: string): Promise<DoctorAvailability[]> {
    try {
      console.log(`Fetching availability for doctor ${doctorId} on ${date}`);
      
      // Use the new database function for better validation
      const { data: availability, error } = await supabase
        .rpc('get_available_time_slots', {
          p_doctor_id: doctorId,
          p_date: date
        });
      
      if (error) {
        console.error('Error fetching availability using RPC:', error);
        
        // Fallback to direct table query if RPC fails
        console.log('Falling back to direct table query...');
        const { data: existingAvailability, error: existingError } = await supabase
          .from('doctor_availability')
          .select('*')
          .eq('doctor_id', doctorId)
          .eq('date', date)
          .eq('is_available', true); // Only get available slots
        
        if (existingError) {
          console.error('Error checking existing availability:', existingError);
          throw existingError;
        }
        
        console.log('Raw availability data from database:', existingAvailability);
        
        // Return existing available slots (no automatic creation)
        const availableSlots = existingAvailability || [];
        console.log(`Found ${availableSlots.length} available slots`);
        console.log('Available slots data:', availableSlots);
        
        // Log the first few slots to see the format
        if (availableSlots.length > 0) {
          console.log('Sample slot data:');
          availableSlots.slice(0, 3).forEach((slot, index) => {
            console.log(`Slot ${index + 1}:`, {
              id: slot.id,
              start_time: slot.start_time,
              start_time_type: typeof slot.start_time,
              start_time_length: slot.start_time?.length,
              start_time_raw: JSON.stringify(slot.start_time),
              end_time: slot.end_time,
              is_available: slot.is_available
            });
          });
        }
        
        return availableSlots;
      }
      
      // Convert RPC result to DoctorAvailability format
      const availableSlots: DoctorAvailability[] = availability.map((slot: any) => ({
        id: `generated-${Date.now()}-${Math.random()}`, // Generate temporary ID
        doctor_id: doctorId,
        date: date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available
      }));
      
      console.log(`Found ${availableSlots.length} available slots using RPC`);
      console.log('Available slots data:', availableSlots);
      
      return availableSlots;
    } catch (error) {
      console.error('Error fetching doctor availability:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return [];
    }
  },



  // Book an appointment
  async bookAppointment(
    patientId: string,
    doctorId: string,
    slotTime: string
  ): Promise<{ data: Appointment | null; error: any }> {
    try {
      console.log(`Booking appointment for patient ${patientId} with doctor ${doctorId} at ${slotTime}`);
      
      // Extract date and time for validation
      const slotDate = slotTime.split('T')[0];
      const slotTimeOnly = slotTime.split('T')[1].substring(0, 5); // HH:MM format
      
      // Additional frontend validation: Check if the slot is actually available
      console.log(`Validating slot availability for ${slotDate} at ${slotTimeOnly}`);
      
      const availability = await this.getDoctorAvailability(doctorId, slotDate);
      const isSlotAvailable = availability.some(slot => {
        let slotStartTime = slot.start_time;
        if (typeof slotStartTime === 'string') {
          // Normalize time format for comparison
          if (slotStartTime.length >= 5 && slotStartTime.includes(':')) {
            slotStartTime = slotStartTime.substring(0, 5);
          }
          if (slotStartTime.includes('T')) {
            slotStartTime = slotStartTime.split('T')[1].substring(0, 5);
          }
        }
        return slotStartTime === slotTimeOnly && slot.is_available;
      });
      
      if (!isSlotAvailable) {
        const error = new Error(`Time slot ${slotTimeOnly} on ${slotDate} is not available for this doctor`);
        console.error('Frontend validation failed:', error.message);
        return { data: null, error };
      }
      
      console.log('Frontend validation passed, proceeding with database booking...');
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          slot_time: slotTime,
          status: 'scheduled',
        })
        .select(`
          *,
          patient:users(*),
          doctor:doctors(*)
        `)
        .single();
      
      if (error) {
        console.error('Supabase error booking appointment:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Appointment booked successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error booking appointment:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return { data: null, error };
    }
  },

  // Get patient appointments
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      console.log(`Fetching appointments for patient ${patientId}`);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users(*),
          doctor:doctors(
            *,
            user:users(*)
          )
        `)
        .eq('patient_id', patientId)
        .order('slot_time', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching patient appointments:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} appointments for patient ${patientId}`);
      
      // Debug: Log the first appointment to see the structure
      if (data && data.length > 0) {
        console.log('First appointment structure:', data[0]);
        if (data[0].doctor) {
          console.log('Doctor data in appointment:', data[0].doctor);
          if (data[0].doctor.user) {
            console.log('Doctor user data:', data[0].doctor.user);
            console.log('Doctor name:', data[0].doctor.user.name);
          } else {
            console.log('No doctor user data found');
          }
        } else {
          console.log('No doctor data in appointment');
        }
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching patient appointments:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return [];
    }
  },

  // Update appointment status
  async updateAppointmentStatus(
    appointmentId: string,
    status: Appointment['status']
  ): Promise<{ data: Appointment | null; error: any }> {
    try {
      console.log(`Updating appointment ${appointmentId} status to ${status}`);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select(`
          *,
          patient:users(*),
          doctor:doctors(
            *,
            user:users(*)
          )
        `)
        .single();
      
      if (error) {
        console.error('Supabase error updating appointment status:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Appointment status updated successfully');
      return { data, error: null };
    } catch (error) {
      console.error('Error updating appointment status:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return { data: null, error };
    }
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<{ error: any }> {
    try {
      console.log(`Cancelling appointment ${appointmentId}`);
      
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);
      
      if (error) {
        console.error('Supabase error cancelling appointment:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Appointment cancelled successfully');
      return { error: null };
    } catch (error) {
      console.error('Error cancelling appointment:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return { error };
    }
  },
};
