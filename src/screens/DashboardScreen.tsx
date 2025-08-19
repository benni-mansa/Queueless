import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import LoadingState from '../components/LoadingState';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
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

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.slot_time);
      return aptDate > now && apt.status === 'scheduled';
    }).slice(0, 3);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  if (isLoading) {
    return (
      <SafeAreaWrapper backgroundColor="#f5f5f5" bottomSafe={false}>
        <LoadingState type="dashboard" />
        <LoadingState type="card" count={3} />
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
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>



        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Total Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {appointments.filter(apt => apt.status === 'scheduled').length}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {appointments.filter(apt => apt.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('BookAppointment')}
          >
            <Text style={styles.actionButtonText}>📅 Book Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyAppointments')}
          >
            <Text style={styles.actionButtonText}>📋 View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {loading || refreshing ? (
            <LoadingState type="appointment" count={2} />
          ) : getUpcomingAppointments().length > 0 ? (
            getUpcomingAppointments().map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                                 <View style={styles.appointmentHeader}>
                   <View style={styles.doctorInfo}>
                     <Text style={styles.doctorName}>
                       Dr. {appointment.doctor?.user?.name || 'Unknown Doctor'}
                     </Text>
                     <Text style={styles.appointmentDate}>
                       {formatDateTime(appointment.slot_time)}
                     </Text>
                   </View>
                   <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                     <Text style={styles.statusText}>
                       {appointment.status.replace('_', ' ').toUpperCase()}
                     </Text>
                   </View>
                 </View>
                 <Text style={styles.appointmentType}>
                   {appointment.service_type || 'General Consultation'}
                 </Text>
              </View>
            ))
          ) : (
            <View style={styles.noAppointments}>
              <Text style={styles.noAppointmentsText}>
                No upcoming appointments
              </Text>
              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => navigation.navigate('BookAppointment')}
              >
                <Text style={styles.bookNowButtonText}>Book Your First Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#e74c3c',
    fontSize: 16,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentsSection: {
    padding: 20,
    backgroundColor: 'white',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  appointmentCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  appointmentDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
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
  appointmentType: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  noAppointments: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAppointmentsText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  bookNowButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  bookNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
