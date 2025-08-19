import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { appointmentService } from '../services/appointmentService';
import { Doctor, DoctorAvailability } from '../types';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import LoadingState from '../components/LoadingState';

interface BookAppointmentScreenProps {
  navigation: any;
}

export const BookAppointmentScreen: React.FC<BookAppointmentScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailability();
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getDoctors();
      console.log('Doctors loaded in BookAppointmentScreen:', data);
      console.log('First doctor structure:', data[0]);
      if (data[0]?.user) {
        console.log('First doctor user data:', data[0].user);
        console.log('First doctor user name:', data[0].user.name);
      }
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const loadAvailability = async () => {
    if (!selectedDoctor) return;
    
    setLoadingAvailability(true);
    try {
      const data = await appointmentService.getDoctorAvailability(
        selectedDoctor.id,
        selectedDate
      );
      setAvailability(data);
    } catch (error) {
      console.error('Error loading availability:', error);
      Alert.alert('Error', 'Failed to load availability');
    } finally {
      setLoadingAvailability(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper backgroundColor="#f5f5f5" bottomSafe={false}>
        <LoadingState type="form" count={3} />
        <LoadingState type="doctor" count={3} />
      </SafeAreaWrapper>
    );
  }

  if (loading) {
    return (
      <SafeAreaWrapper backgroundColor="#f5f5f5" bottomSafe={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  const generateTimeSlots = () => {
    if (!availability || availability.length === 0) {
      console.log('No availability data to generate time slots from');
      return [];
    }
    
    console.log('Availability data:', availability);
    
    // Only show the time slots that admin has explicitly scheduled
    const slots = availability.map(slot => {
      let slotTime = slot.start_time;
      if (typeof slotTime === 'string') {
        // Extract just HH:MM format for display
        if (slotTime.length >= 5 && slotTime.includes(':')) {
          slotTime = slotTime.substring(0, 5);
        }
        if (slotTime.includes('T')) {
          slotTime = slotTime.split('T')[1].substring(0, 5);
        }
      }
      
      return { 
        time: slotTime, 
        isAvailable: slot.is_available 
      };
    });

    console.log('Generated time slots:', slots);
    return slots;
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a doctor, date, and time');
      return;
    }

    try {
      const { error } = await appointmentService.bookAppointment(
        user!.id,
        selectedDoctor.id,
        `${selectedDate}T${selectedTime}:00`
      );

      if (error) {
        Alert.alert('Error', error.message || 'Failed to book appointment');
      } else {
        Alert.alert(
          'Success',
          'Appointment booked successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MyAppointments'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaWrapper backgroundColor="#f5f5f5" bottomSafe={false}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Book Appointment</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Doctor</Text>
          {doctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              style={[
                styles.doctorCard,
                selectedDoctor?.id === doctor.id && styles.selectedDoctorCard,
              ]}
              onPress={() => setSelectedDoctor(doctor)}
            >
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>
                  Dr. {doctor.user?.name || 'Unknown'}
                </Text>
                <Text style={styles.doctorSpecialty}>
                  {doctor.specialty || 'General'}
                </Text>
              </View>
              {selectedDoctor?.id === doctor.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedIndicatorText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateContainer}>
              {generateDateOptions().map((date) => {
                const dateObj = new Date(date);
                const isSelected = selectedDate === date;
                const isToday = date === new Date().toISOString().split('T')[0];
                
                return (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateCard,
                      isSelected && styles.selectedDateCard,
                      isToday && styles.todayCard,
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.dateDay,
                      isSelected && styles.selectedDateText,
                      isToday && styles.todayText,
                    ]}>
                      {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text style={[
                      styles.dateNumber,
                      isSelected && styles.selectedDateText,
                      isToday && styles.todayText,
                    ]}>
                      {dateObj.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          {loadingAvailability ? (
            <LoadingState type="timeSlots" />
          ) : (
            <View style={styles.timeSlotsContainer}>
              {generateTimeSlots().map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    selectedTime === slot.time && styles.selectedTimeSlot,
                    !slot.isAvailable && styles.unavailableTimeSlot,
                  ]}
                  onPress={() => slot.isAvailable && setSelectedTime(slot.time)}
                  disabled={!slot.isAvailable}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === slot.time && styles.selectedTimeSlotText,
                    !slot.isAvailable && styles.unavailableTimeSlotText,
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDoctor || !selectedDate || !selectedTime) && styles.bookButtonDisabled,
          ]}
          onPress={handleBookAppointment}
          disabled={!selectedDoctor || !selectedDate || !selectedTime}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  doctorCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDoctorCard: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  selectedIndicator: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  dateCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDateCard: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  todayCard: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  dateDay: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  todayText: {
    color: '#3498db',
  },
  selectedDateText: {
    color: '#3498db',
    fontWeight: '600',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeSlot: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '30%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeSlot: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  unavailableTimeSlot: {
    backgroundColor: '#ecf0f1',
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  selectedTimeSlotText: {
    color: '#3498db',
    fontWeight: '600',
  },
  unavailableTimeSlotText: {
    color: '#95a5a6',
  },
  bookButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
