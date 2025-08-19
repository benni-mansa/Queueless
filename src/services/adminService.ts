import { supabase, supabaseAdmin } from './supabase';
import { Doctor, User, DoctorAvailability, Appointment, ServiceCategory } from '../types';

export const adminService = {
  // ===== DOCTOR MANAGEMENT =====
  
  // Get all doctors with user information
  async getDoctors(): Promise<Doctor[]> {
    try {
      console.log('Admin: Fetching all doctors...');
      
      const { data, error } = await supabaseAdmin
        .from('doctors')
        .select(`
          *,
          user:users(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Admin: Supabase error fetching doctors:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`Admin: Successfully fetched ${data?.length || 0} doctors`);
      return data || [];
    } catch (error) {
      console.error('Admin: Error fetching doctors:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Get a specific doctor by ID
  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    try {
      console.log(`Admin: Fetching doctor ${doctorId}...`);
      
      const { data, error } = await supabaseAdmin
        .from('doctors')
        .select(`
          *,
          user:users(*)
        `)
        .eq('id', doctorId)
        .single();
      
      if (error) {
        console.error('Admin: Supabase error fetching doctor:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Admin: Successfully fetched doctor');
      return data;
    } catch (error) {
      console.error('Admin: Error fetching doctor:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Create a new doctor
  async createDoctor(doctorData: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    experience?: string;
    education?: string;
    bio?: string;
  }): Promise<Doctor> {
    try {
      console.log('Admin: Creating new doctor...', { email: doctorData.email });
      
      // First create the user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: doctorData.email,
        password: 'temporary123', // This should be changed by the doctor
        email_confirm: true,
        user_metadata: {
          name: doctorData.name,
          phone: doctorData.phone,
          role: 'doctor'
        }
      });
      
      if (userError) {
        console.error('Admin: Error creating user:', userError);
        throw userError;
      }
      
      if (!userData.user) {
        throw new Error('Failed to create user');
      }
      
                    // Update the user profile with additional information
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: userData.user.id,
            name: doctorData.name,
            phone: doctorData.phone,
            role: 'doctor'
          });
      
      if (profileError) {
        console.error('Admin: Error updating user profile:', profileError);
        throw profileError;
      }
      
      // Create the doctor record
      const { data: doctorRecord, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .insert({
          user_id: userData.user.id,
          specialty: doctorData.specialty,
          experience: doctorData.experience || '',
          education: doctorData.education || '',
          bio: doctorData.bio || ''
        })
        .select(`
          *,
          user:users(*)
        `)
        .single();
      
      if (doctorError) {
        console.error('Admin: Error creating doctor record:', doctorError);
        throw doctorError;
      }
      
      console.log('Admin: Successfully created doctor');
      return doctorRecord;
    } catch (error) {
      console.error('Admin: Error creating doctor:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Update an existing doctor
  async updateDoctor(doctorId: string, updateData: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    experience?: string;
    education?: string;
    bio?: string;
  }): Promise<Doctor> {
    try {
      console.log(`Admin: Updating doctor ${doctorId}...`);
      
      // Get the current doctor to find the user_id
      const currentDoctor = await this.getDoctorById(doctorId);
      if (!currentDoctor) {
        throw new Error('Doctor not found');
      }
      
             // Update the user profile
       const { error: userError } = await supabaseAdmin
         .from('users')
         .update({
           name: updateData.name,
           phone: updateData.phone
         })
         .eq('id', currentDoctor.user_id);
      
      if (userError) {
        console.error('Admin: Error updating user profile:', userError);
        throw userError;
      }
      
      // Update the doctor record
      const { data: updatedDoctor, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .update({
          specialty: updateData.specialty,
          experience: updateData.experience || '',
          education: updateData.education || '',
          bio: updateData.bio || ''
        })
        .eq('id', doctorId)
        .select(`
          *,
          user:users(*)
        `)
        .single();
      
      if (doctorError) {
        console.error('Admin: Error updating doctor record:', doctorError);
        throw doctorError;
      }
      
      console.log('Admin: Successfully updated doctor');
      return updatedDoctor;
    } catch (error) {
      console.error('Admin: Error updating doctor:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Delete a doctor
  async deleteDoctor(doctorId: string): Promise<void> {
    try {
      console.log(`Admin: Deleting doctor ${doctorId}...`);
      
      // Get the current doctor to find the user_id
      const currentDoctor = await this.getDoctorById(doctorId);
      if (!currentDoctor) {
        throw new Error('Doctor not found');
      }
      
      // Delete the doctor record first
      const { error: doctorError } = await supabaseAdmin
        .from('doctors')
        .delete()
        .eq('id', doctorId);
      
      if (doctorError) {
        console.error('Admin: Error deleting doctor record:', doctorError);
        throw doctorError;
      }
      
      // Delete the user (this will cascade to related records)
      const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(
        currentDoctor.user_id
      );
      
      if (userError) {
        console.error('Admin: Error deleting user:', userError);
        throw userError;
      }
      
      console.log('Admin: Successfully deleted doctor');
    } catch (error) {
      console.error('Admin: Error deleting doctor:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // ===== AVAILABILITY MANAGEMENT =====
  
  // Set doctor availability for a specific date
  async setDoctorAvailability(
    doctorId: string,
    date: string,
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>
  ): Promise<void> {
    try {
      console.log(`Admin: Setting availability for doctor ${doctorId} on ${date}...`);
      
      // First, delete existing availability for this date
      const { error: deleteError } = await supabaseAdmin
        .from('doctor_availability')
        .delete()
        .eq('doctor_id', doctorId)
        .eq('date', date);
      
      if (deleteError) {
        console.error('Admin: Error deleting existing availability:', deleteError);
        throw deleteError;
      }
      
      // Create new availability records for available slots
      const availableSlots = timeSlots.filter(slot => slot.isAvailable);
      
      if (availableSlots.length > 0) {
        const availabilityRecords = availableSlots.map(slot => ({
          doctor_id: doctorId,
          date: date,
          start_time: slot.startTime,
          end_time: slot.endTime,
          is_available: true
        }));
        
        const { error: insertError } = await supabaseAdmin
          .from('doctor_availability')
          .insert(availabilityRecords);
        
        if (insertError) {
          console.error('Admin: Error inserting availability records:', insertError);
          throw insertError;
        }
      }
      
      console.log(`Admin: Successfully set availability for ${availableSlots.length} slots`);
    } catch (error) {
      console.error('Admin: Error setting doctor availability:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Get doctor availability for a date range
  async getDoctorAvailability(
    doctorId: string,
    startDate: string,
    endDate: string
  ): Promise<DoctorAvailability[]> {
    try {
      console.log(`Admin: Fetching availability for doctor ${doctorId} from ${startDate} to ${endDate}...`);
      
      const { data, error } = await supabaseAdmin
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('Admin: Supabase error fetching availability:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`Admin: Successfully fetched ${data?.length || 0} availability records`);
      return data || [];
    } catch (error) {
      console.error('Admin: Error fetching doctor availability:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // ===== PATIENT MANAGEMENT =====
  
  // Get all patients
  async getPatients(): Promise<User[]> {
    try {
      console.log('Admin: Fetching all patients...');
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('role', 'patient')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Admin: Supabase error fetching patients:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`Admin: Successfully fetched ${data?.length || 0} patients`);
      return data || [];
    } catch (error) {
      console.error('Admin: Error fetching patients:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Add a new patient
  async addPatient(patientData: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    address?: string;
  }): Promise<User> {
    try {
      console.log('Admin: Adding new patient...', { email: patientData.email });
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          name: patientData.name,
          email: patientData.email,
          phone: patientData.phone,
          date_of_birth: patientData.dateOfBirth,
          address: patientData.address,
          role: 'patient'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Admin: Error adding patient:', error);
        throw error;
      }
      
      console.log('Admin: Successfully added patient');
      return data;
    } catch (error) {
      console.error('Admin: Error adding patient:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Update an existing patient
  async updatePatient(patientId: string, updateData: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    address?: string;
  }): Promise<User> {
    try {
      console.log(`Admin: Updating patient ${patientId}...`);
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          name: updateData.name,
          email: updateData.email,
          phone: updateData.phone,
          date_of_birth: updateData.dateOfBirth,
          address: updateData.address
        })
        .eq('id', patientId)
        .select()
        .single();
      
      if (error) {
        console.error('Admin: Error updating patient:', error);
        throw error;
      }
      
      console.log('Admin: Successfully updated patient');
      return data;
    } catch (error) {
      console.error('Admin: Error updating patient:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Delete a patient
  async deletePatient(patientId: string): Promise<void> {
    try {
      console.log(`Admin: Deleting patient ${patientId}...`);
      
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', patientId);
      
      if (error) {
        console.error('Admin: Error deleting patient:', error);
        throw error;
      }
      
      console.log('Admin: Successfully deleted patient');
    } catch (error) {
      console.error('Admin: Error deleting patient:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // ===== APPOINTMENT MANAGEMENT =====
  
  // Get all appointments
  async getAppointments(): Promise<Appointment[]> {
    try {
      console.log('Admin: Fetching all appointments...');
      
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(`
          *,
          patient:users(*),
          doctor:doctors(*)
        `)
        .order('slot_time', { ascending: false });
      
      if (error) {
        console.error('Admin: Supabase error fetching appointments:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`Admin: Successfully fetched ${data?.length || 0} appointments`);
      return data || [];
    } catch (error) {
      console.error('Admin: Error fetching appointments:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Get pending appointments
  async getPendingAppointments(): Promise<Appointment[]> {
    try {
      console.log('Admin: Fetching pending appointments...');
      
      const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(`
          *,
          patient:users(*),
          doctor:doctors(*)
        `)
        .eq('status', 'scheduled')
        .order('slot_time', { ascending: true });
      
      if (error) {
        console.error('Admin: Supabase error fetching pending appointments:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`Admin: Successfully fetched ${data?.length || 0} pending appointments`);
      return data || [];
    } catch (error) {
      console.error('Admin: Error fetching pending appointments:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, newStatus: string): Promise<void> {
    try {
      console.log(`Admin: Updating appointment ${appointmentId} status to ${newStatus}...`);
      
      const { error } = await supabaseAdmin
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);
      
      if (error) {
        console.error('Admin: Error updating appointment status:', error);
        throw error;
      }
      
      console.log('Admin: Successfully updated appointment status');
    } catch (error) {
      console.error('Admin: Error updating appointment status:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // ===== SERVICE MANAGEMENT =====
  
  // Get all service categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      console.log('Admin: Fetching service categories...');
      
      const { data, error } = await supabaseAdmin
        .from('service_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Admin: Supabase error fetching service categories:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log(`Admin: Successfully fetched ${data?.length || 0} service categories`);
      return data || [];
    } catch (error) {
      console.error('Admin: Error fetching service categories:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Create a new service category
  async createServiceCategory(categoryData: {
    name: string;
    description?: string;
    slotDuration: number;
    bufferTime: number;
  }): Promise<ServiceCategory> {
    try {
      console.log('Admin: Creating new service category...', { name: categoryData.name });
      
      const { data, error } = await supabaseAdmin
        .from('service_categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || '',
          slot_duration: categoryData.slotDuration,
          buffer_time: categoryData.bufferTime
        })
        .select()
        .single();
      
      if (error) {
        console.error('Admin: Supabase error creating service category:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Admin: Successfully created service category');
      return data;
    } catch (error) {
      console.error('Admin: Error creating service category:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // ===== SYSTEM STATISTICS =====
  
  // Get system statistics
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    appointmentsThisMonth: number;
    revenueThisMonth: number;
  }> {
    try {
      console.log('Admin: Fetching system statistics...');
      
      const [
        users,
        doctors,
        patients,
        appointments
      ] = await Promise.all([
        this.getDoctors(),
        this.getPatients(),
        this.getAppointments(),
        this.getAppointments()
      ]);
      
      // Calculate monthly appointments
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const monthlyAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.slot_time);
        return aptDate.getMonth() === thisMonth && aptDate.getFullYear() === thisYear;
      });
      
      const stats = {
        totalUsers: users.length + patients.length,
        totalDoctors: users.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        appointmentsThisMonth: monthlyAppointments.length,
        revenueThisMonth: monthlyAppointments.length * 100 // Assuming $100 per appointment
      };
      
      console.log('Admin: Successfully fetched system statistics');
      return stats;
    } catch (error) {
      console.error('Admin: Error fetching system statistics:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
};
