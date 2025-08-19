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

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  isActive: boolean;
}

interface ServiceFormData {
  name: string;
  description: string;
  duration: string;
  price: string;
}

export default function ServiceManagementScreen({ navigation }: any) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration: '',
    price: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the service might not exist yet
      const mockServices: Service[] = [
        {
          id: '1',
          name: 'General Consultation',
          description: 'Basic medical consultation with a doctor',
          duration: 30,
          price: 50,
          isActive: true,
        },
        {
          id: '2',
          name: 'Specialist Consultation',
          description: 'Consultation with a medical specialist',
          duration: 45,
          price: 100,
          isActive: true,
        },
        {
          id: '3',
          name: 'Follow-up Visit',
          description: 'Follow-up appointment for ongoing treatment',
          duration: 20,
          price: 30,
          isActive: true,
        },
      ];
      setServices(mockServices);
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: '',
      price: '',
    });
    setEditingService(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.duration || !formData.price) {
      Alert.alert('Error', 'Name, duration, and price are required');
      return;
    }

    const duration = parseInt(formData.duration);
    const price = parseFloat(formData.price);

    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Duration must be a positive number');
      return;
    }

    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'Price must be a non-negative number');
      return;
    }

    try {
      if (editingService) {
        // Update existing service
        const updatedService = {
          ...editingService,
          name: formData.name,
          description: formData.description,
          duration,
          price,
        };
        
        // Update the service in the local state
        setServices(services.map(s => s.id === editingService.id ? updatedService : s));
        Alert.alert('Success', 'Service updated successfully');
      } else {
        // Add new service
        const newService: Service = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          duration,
          price,
          isActive: true,
        };
        
        setServices([...services, newService]);
        Alert.alert('Success', 'Service added successfully');
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration.toString(),
      price: service.price.toString(),
    });
    setShowAddModal(true);
  };

  const handleDelete = (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setServices(services.filter(s => s.id !== serviceId));
            Alert.alert('Success', 'Service deleted successfully');
          },
        },
      ]
    );
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading services...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Service Management</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Services List */}
        <View style={styles.content}>
          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: service.isActive ? '#27ae60' + '20' : '#e74c3c' + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: service.isActive ? '#27ae60' : '#e74c3c' }
                    ]}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <View style={styles.serviceDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.detailText}>{service.duration} min</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="card" size={16} color="#666" />
                    <Text style={styles.detailText}>${service.price}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, service.isActive ? styles.deactivateButton : styles.activateButton]}
                  onPress={() => toggleServiceStatus(service.id)}
                >
                  <Ionicons 
                    name={service.isActive ? "pause" : "play"} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.actionButtonText}>
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(service)}
                >
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(service.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {services.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No services found</Text>
              <Text style={styles.emptySubtext}>Add your first service to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Service Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />
              <TextInput
                style={styles.input}
                placeholder="Duration (minutes)"
                value={formData.duration}
                onChangeText={(text) => setFormData({ ...formData, duration: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Price ($)"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.saveButtonText}>
                    {editingService ? 'Update' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  content: {
    padding: 15,
  },
  serviceCard: {
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
  serviceInfo: {
    marginBottom: 15,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  activateButton: {
    backgroundColor: '#27ae60',
  },
  deactivateButton: {
    backgroundColor: '#f39c12',
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
