import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import { Doctor, User } from '../types';

interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  education: string;
  bio: string;
}

// Move FormModal outside the component to prevent re-renders
const FormModal = React.memo(({ 
  visible, 
  editingDoctor, 
  formData, 
  onClose, 
  onSubmit, 
  onFormDataChange 
}: {
  visible: boolean;
  editingDoctor: Doctor | null;
  formData: DoctorFormData;
  onClose: () => void;
  onSubmit: () => void;
  onFormDataChange: (field: keyof DoctorFormData, value: string) => void;
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
  >
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => onFormDataChange('name', text)}
            placeholder="Enter doctor's full name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => onFormDataChange('email', text)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => onFormDataChange('phone', text)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Specialty *</Text>
          <TextInput
            style={styles.input}
            value={formData.specialty}
            onChangeText={(text) => onFormDataChange('specialty', text)}
            placeholder="e.g., Cardiology, Neurology"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Experience</Text>
          <TextInput
            style={styles.input}
            value={formData.experience}
            onChangeText={(text) => onFormDataChange('experience', text)}
            placeholder="e.g., 10 years"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Education</Text>
          <TextInput
            style={styles.input}
            value={formData.education}
            onChangeText={(text) => onFormDataChange('education', text)}
            placeholder="e.g., MD, MBBS"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) => onFormDataChange('bio', text)}
            placeholder="Brief description about the doctor"
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={onSubmit}>
          <Text style={styles.saveButtonText}>
            {editingDoctor ? 'Update' : 'Add Doctor'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </Modal>
));

export default function DoctorManagementScreen({ navigation, route }: any) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '',
    education: '',
    bio: '',
  });

  const doctorId = route.params?.doctorId;

  useEffect(() => {
    loadDoctors();
    if (doctorId) {
      loadDoctorForEdit(doctorId);
    }
  }, [doctorId]);

  const loadDoctors = React.useCallback(async () => {
    try {
      setLoading(true);
      const doctorsData = await adminService.getDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDoctorForEdit = React.useCallback(async (id: string) => {
    try {
      const doctor = await adminService.getDoctorById(id);
      if (doctor) {
        setEditingDoctor(doctor);
        setFormData({
          name: doctor.user?.name || '',
          email: doctor.user?.email || '',
          phone: doctor.user?.phone || '',
          specialty: doctor.specialty || '',
          experience: '',
          education: '',
          bio: '',
        });
      }
    } catch (error) {
      console.error('Error loading doctor for edit:', error);
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadDoctors();
    setRefreshing(false);
  }, [loadDoctors]);

  const resetForm = React.useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      experience: '',
      education: '',
      bio: '',
    });
    setEditingDoctor(null);
  }, []);

  const handleSubmit = async () => {
    console.log('Form data on submit:', formData);
    if (!formData.name || !formData.email || !formData.specialty) {
      console.log('Validation failed:', { name: formData.name, email: formData.email, specialty: formData.specialty });
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingDoctor) {
        await adminService.updateDoctor(editingDoctor.id, formData);
        Alert.alert('Success', 'Doctor updated successfully');
      } else {
        await adminService.createDoctor(formData);
        Alert.alert('Success', 'Doctor added successfully');
      }
      
      setShowAddModal(false);
      resetForm();
      loadDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      Alert.alert('Error', 'Failed to save doctor');
    }
  };

  const handleDeleteDoctor = React.useCallback(async (doctorId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this doctor? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteDoctor(doctorId);
              Alert.alert('Success', 'Doctor deleted successfully');
              loadDoctors();
            } catch (error) {
              console.error('Error deleting doctor:', error);
              Alert.alert('Error', 'Failed to delete doctor');
            }
          },
        },
      ]
    );
  }, [loadDoctors]);

  const openEditModal = React.useCallback((doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      phone: doctor.user?.phone || '',
      specialty: doctor.specialty || '',
      experience: '',
      education: '',
      bio: '',
    });
    setShowAddModal(true);
  }, []);

  const openAddModal = React.useCallback(() => {
    resetForm();
    setShowAddModal(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setShowAddModal(false);
    resetForm();
  }, []);

  const DoctorCard = React.useCallback(({ doctor }: { doctor: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>
          {doctor.user?.name || 'Unknown Doctor'}
        </Text>
        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
        <Text style={styles.doctorContact}>
          {doctor.user?.email} • {doctor.user?.phone}
        </Text>
      </View>
      <View style={styles.doctorActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(doctor)}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteDoctor(doctor.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  ), [openEditModal]);

  // Create a handler for form data changes
  const handleFormDataChange = React.useCallback((field: keyof DoctorFormData, value: string) => {
    console.log('Updating field:', field, 'with value:', value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New form data:', newData);
      return newData;
    });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading doctors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Management</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {doctors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Doctors Added</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding your first doctor to the system
            </Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
              <Text style={styles.addFirstButtonText}>Add First Doctor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.doctorsList}>
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </View>
        )}
      </ScrollView>

      <FormModal
        visible={showAddModal}
        editingDoctor={editingDoctor}
        formData={formData}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormDataChange={handleFormDataChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  doctorsList: {
    padding: 15,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  doctorContact: {
    fontSize: 14,
    color: '#666',
  },
  doctorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF20',
  },
  deleteButton: {
    backgroundColor: '#FF3B3020',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
