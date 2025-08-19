import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import { Appointment, Doctor, User } from '../types';

export default function AppointmentManagementScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const appointmentsData = await adminService.getAppointments();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const getFilteredAppointments = () => {
    if (filter === 'all') return appointments;
    return appointments.filter(apt => apt.status === filter);
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await adminService.updateAppointmentStatus(appointmentId, newStatus);
      Alert.alert('Success', 'Appointment status updated successfully');
      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Error', 'Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.updateAppointmentStatus(appointmentId, 'cancelled');
              Alert.alert('Success', 'Appointment cancelled successfully');
              loadAppointments();
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ]
    );
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
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'confirmed': return 'Confirmed';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'no_show': return 'No Show';
      default: return status;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading appointments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Management</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((filterOption) => (
              <TouchableOpacity
                key={filterOption}
                style={[
                  styles.filterTab,
                  filter === filterOption && styles.filterTabActive
                ]}
                onPress={() => setFilter(filterOption as any)}
              >
                <Text style={[
                  styles.filterTabText,
                  filter === filterOption && styles.filterTabTextActive
                ]}>
                  {filterOption === 'all' ? 'All' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Appointments List */}
        <View style={styles.content}>
          {filteredAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>
                    {appointment.patient?.name || 'Unknown Patient'}
                  </Text>
                  <Text style={styles.doctorName}>
                    Dr. {appointment.doctor?.user?.name || 'Unknown Doctor'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                    {getStatusText(appointment.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {formatDateTime(appointment.slot_time)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="medical" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {appointment.service_type || 'General Consultation'}
                  </Text>
                </View>
                {appointment.notes && (
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text" size={16} color="#666" />
                    <Text style={styles.detailText} numberOfLines={2}>
                      {appointment.notes}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionButtons}>
                {appointment.status === 'scheduled' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.confirmButton]}
                      onPress={() => handleStatusUpdate(appointment.id, 'confirmed')}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancelAppointment(appointment.id)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.progressButton]}
                    onPress={() => handleStatusUpdate(appointment.id, 'in_progress')}
                  >
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Start</Text>
                  </TouchableOpacity>
                )}
                {appointment.status === 'in_progress' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => handleStatusUpdate(appointment.id, 'completed')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          
          {filteredAppointments.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No appointments found</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'all' 
                  ? 'No appointments in the system yet' 
                  : `No ${filter} appointments found`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  content: {
    padding: 15,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  progressButton: {
    backgroundColor: '#f39c12',
  },
  completeButton: {
    backgroundColor: '#27ae60',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
