import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import LoadingState from '../components/LoadingState';

interface MyAppointmentsScreenProps {
  navigation: any;
}

export const MyAppointmentsScreen: React.FC<MyAppointmentsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await appointmentService.getPatientAppointments(user.id);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await appointmentService.cancelAppointment(appointment.id);
              if (error) {
                Alert.alert('Error', 'Failed to cancel appointment');
              } else {
                Alert.alert('Success', 'Appointment cancelled successfully');
                loadAppointments();
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3498db';
      case 'confirmed': return '#27ae60';
      case 'in_progress': return '#f39c12';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      case 'no_show': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const canCancelAppointment = (appointment: Appointment) => {
    const now = new Date();
    const appointmentTime = new Date(appointment.slot_time);
    const hoursDifference = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Can cancel up to 2 hours before appointment
    return hoursDifference > 2 && appointment.status === 'scheduled';
  };

  const groupAppointmentsByDate = () => {
    const groups: { [key: string]: Appointment[] } = {};
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.slot_time).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper backgroundColor="#f5f5f5" bottomSafe={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Appointments</Text>
        </View>
        <LoadingState type="appointment" count={5} />
      </SafeAreaWrapper>
    );
  }

  if (loading) {
    return (
      <SafeAreaWrapper backgroundColor="#f5f5f5" bottomSafe={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor="#f5f5f5" bottomSafe={false}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Appointments</Text>
        </View>

        {refreshing ? (
          <LoadingState type="appointment" count={3} />
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No appointments found</Text>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigation.navigate('BookAppointment')}
            >
              <Text style={styles.bookButtonText}>Book Your First Appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          groupAppointmentsByDate().map(([date, dateAppointments]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              
              {dateAppointments.map((appointment) => {
                const { date: aptDate, time: aptTime } = formatDateTime(appointment.slot_time);
                
                return (
                  <View key={appointment.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.doctorName}>
                        Dr. {appointment.doctor?.user?.name || 'Unknown'}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(appointment.status) }
                      ]}>
                        <Text style={styles.statusText}>
                          {getStatusText(appointment.status)}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.specialty}>
                      {appointment.doctor?.specialty || 'General'}
                    </Text>
                    
                    <Text style={styles.appointmentTime}>
                      {aptTime}
                    </Text>

                    <Text style={styles.appointmentDate}>
                      {aptDate}
                    </Text>

                    {canCancelAppointment(appointment) && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelAppointment(appointment)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dateGroup: {
    margin: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  appointmentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  specialty: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  appointmentTime: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 10,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
