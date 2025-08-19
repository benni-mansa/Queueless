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
import { Ionicons } from '@expo/vector-icons';
import { appointmentService } from '../services/appointmentService';
import { adminService } from '../services/adminService';
import { Doctor, User } from '../types';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import LoadingState from '../components/LoadingState';

interface AdminStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
}

export default function AdminDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<AdminStats>({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
  });
  const [recentDoctors, setRecentDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [doctors, patients, appointments, pendingAppointments] = await Promise.all([
        adminService.getDoctors(),
        adminService.getPatients(),
        adminService.getAppointments(),
        adminService.getPendingAppointments(),
      ]);

      setStats({
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        pendingAppointments: pendingAppointments.length,
      });

      setRecentDoctors(doctors.slice(0, 5)); // Show last 5 doctors
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const navigateToSection = (section: string) => {
    switch (section) {
      case 'doctors':
        navigation.navigate('DoctorManagement');
        break;
      case 'availability':
        navigation.navigate('AvailabilityManagement');
        break;
      case 'patients':
        navigation.navigate('PatientManagement');
        break;
      case 'appointments':
        navigation.navigate('AppointmentManagement');
        break;
      case 'services':
        navigation.navigate('ServiceManagement');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper backgroundColor="#f5f5f5" bottomSafe={false}>
        <LoadingState type="dashboard" />
        <LoadingState type="card" count={4} />
      </SafeAreaWrapper>
    );
  }

  const StatCard = ({ title, value, icon, color, onPress }: any) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <Ionicons name={icon} size={24} color={color} />
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>System Overview & Management</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Doctors"
            value={stats.totalDoctors}
            icon="medical"
            color="#3498db"
            onPress={() => navigateToSection('doctors')}
          />
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon="people"
            color="#27ae60"
            onPress={() => navigateToSection('patients')}
          />
          <StatCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon="calendar"
            color="#f39c12"
            onPress={() => navigateToSection('appointments')}
          />
          <StatCard
            title="Pending Appointments"
            value={stats.pendingAppointments}
            icon="time"
            color="#e74c3c"
            onPress={() => navigateToSection('appointments')}
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigateToSection('doctors')}
            >
              <Ionicons name="add-circle" size={24} color="#3498db" />
              <Text style={styles.actionButtonText}>Add Doctor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigateToSection('availability')}
            >
              <Ionicons name="calendar" size={24} color="#27ae60" />
              <Text style={styles.actionButtonText}>Manage Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigateToSection('services')}
            >
              <Ionicons name="settings" size={24} color="#f39c12" />
              <Text style={styles.actionButtonText}>Services</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Doctors</Text>
          {loading ? (
            <LoadingState type="doctor" count={3} />
          ) : recentDoctors.length > 0 ? (
            recentDoctors.map((doctor) => (
              <View key={doctor.id} style={styles.doctorCard}>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>
                    Dr. {doctor.user?.name || 'Unknown'}
                  </Text>
                  <Text style={styles.doctorSpecialty}>
                    {doctor.specialty || 'General'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => navigateToSection('doctors')}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No doctors found</Text>
              <TouchableOpacity
                style={styles.addDoctorButton}
                onPress={() => navigateToSection('doctors')}
              >
                <Text style={styles.addDoctorButtonText}>Add First Doctor</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: 14,
    color: '#666',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  // New styles for the updated layout
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 15,
    gap: 10,
  },
  quickActions: {
    margin: 15,
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  recentSection: {
    margin: 15,
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  addDoctorButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addDoctorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
