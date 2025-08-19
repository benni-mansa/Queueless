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
import { Doctor, DoctorAvailability } from '../types';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DaySchedule {
  date: string;
  isWorkingDay: boolean;
  timeSlots: TimeSlot[];
}

export default function AvailabilityManagementScreen({ navigation }: any) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<DaySchedule[]>([]);

  useEffect(() => {
    loadDoctors();
    generateCurrentWeek();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const doctorsData = await adminService.getDoctors();
      setDoctors(doctorsData);
      if (doctorsData.length > 0) {
        setSelectedDoctor(doctorsData[0]);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const generateCurrentWeek = () => {
    const today = new Date();
    const week: DaySchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      week.push({
        date: dateString,
        isWorkingDay: !isWeekend,
        timeSlots: generateDefaultTimeSlots(),
      });
    }
    
    setCurrentWeek(week);
  };

  const generateDefaultTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isAvailable: true,
      });
    }
    return slots;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDoctors();
    setRefreshing(false);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowAddModal(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedDoctor || !selectedDate) {
      Alert.alert('Error', 'Please select a doctor and date');
      return;
    }

    try {
      // Save availability for the selected date
      await adminService.setDoctorAvailability(
        selectedDoctor.id,
        selectedDate,
        currentWeek.find(day => day.date === selectedDate)?.timeSlots || []
      );
      
      Alert.alert('Success', 'Availability updated successfully');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving availability:', error);
      Alert.alert('Error', 'Failed to save availability');
    }
  };

  const toggleTimeSlot = (date: string, slotIndex: number) => {
    setCurrentWeek(prev => 
      prev.map(day => 
        day.date === date 
          ? {
              ...day,
              timeSlots: day.timeSlots.map((slot, index) => 
                index === slotIndex 
                  ? { ...slot, isAvailable: !slot.isAvailable }
                  : slot
              )
            }
          : day
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const DayCard = ({ day }: { day: DaySchedule }) => (
    <TouchableOpacity
      style={[
        styles.dayCard,
        day.date === selectedDate && styles.selectedDayCard,
        !day.isWorkingDay && styles.weekendCard
      ]}
      onPress={() => day.isWorkingDay && handleDateSelect(day.date)}
      disabled={!day.isWorkingDay}
    >
      <Text style={[
        styles.dayDate,
        day.date === selectedDate && styles.selectedDayText
      ]}>
        {formatDate(day.date)}
      </Text>
      <Text style={[
        styles.dayStatus,
        day.date === selectedDate && styles.selectedDayText
      ]}>
        {!day.isWorkingDay ? 'Weekend' : 'Working Day'}
      </Text>
      {day.isWorkingDay && (
        <View style={styles.timeSlotsPreview}>
          {day.timeSlots.slice(0, 3).map((slot, index) => (
            <View
              key={index}
              style={[
                styles.slotIndicator,
                slot.isAvailable ? styles.availableSlot : styles.unavailableSlot
              ]}
            />
          ))}
          {day.timeSlots.length > 3 && (
            <Text style={styles.moreSlotsText}>+{day.timeSlots.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const AvailabilityModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Set Availability for {selectedDoctor?.user?.name}
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Date:</Text>
            <Text style={styles.dateValue}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.timeSlotsContainer}>
            <Text style={styles.sectionTitle}>Time Slots</Text>
            <Text style={styles.sectionSubtitle}>
              Tap to toggle availability for each time slot
            </Text>
            
            {currentWeek
              .find(day => day.date === selectedDate)
              ?.timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotRow,
                    slot.isAvailable ? styles.availableSlotRow : styles.unavailableSlotRow
                  ]}
                  onPress={() => toggleTimeSlot(selectedDate, index)}
                >
                  <View style={styles.timeSlotInfo}>
                    <Text style={styles.timeSlotTime}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                    <Text style={styles.timeSlotDuration}>1 hour</Text>
                  </View>
                  <View style={styles.availabilityIndicator}>
                    <Ionicons
                      name={slot.isAvailable ? "checkmark-circle" : "close-circle"}
                      size={24}
                      color={slot.isAvailable ? "#34C759" : "#FF3B30"}
                    />
                    <Text style={[
                      styles.availabilityText,
                      { color: slot.isAvailable ? "#34C759" : "#FF3B30" }
                    ]}>
                      {slot.isAvailable ? "Available" : "Unavailable"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionButtons}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  setCurrentWeek(prev => 
                    prev.map(day => 
                      day.date === selectedDate 
                        ? { ...day, timeSlots: day.timeSlots.map(slot => ({ ...slot, isAvailable: true })) }
                        : day
                    )
                  );
                }}
              >
                <Text style={styles.quickActionButtonText}>Make All Available</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickActionButton, styles.clearButton]}
                onPress={() => {
                  setCurrentWeek(prev => 
                    prev.map(day => 
                      day.date === selectedDate 
                        ? { ...day, timeSlots: day.timeSlots.map(slot => ({ ...slot, isAvailable: false })) }
                        : day
                    )
                  );
                }}
              >
                <Text style={[styles.quickActionButtonText, styles.clearButtonText]}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAvailability}>
            <Text style={styles.saveButtonText}>Save Availability</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading availability management...</Text>
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
        <Text style={styles.headerTitle}>Availability Management</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Doctor Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Doctor</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.doctorSelection}>
              {doctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.doctorChip,
                    selectedDoctor?.id === doctor.id && styles.selectedDoctorChip
                  ]}
                  onPress={() => setSelectedDoctor(doctor)}
                >
                  <Text style={[
                    styles.doctorChipText,
                    selectedDoctor?.id === doctor.id && styles.selectedDoctorChipText
                  ]}>
                    {doctor.user?.name}
                  </Text>
                  <Text style={[
                    styles.doctorChipSpecialty,
                    selectedDoctor?.id === doctor.id && styles.selectedDoctorChipText
                  ]}>
                    {doctor.specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Week Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Schedule</Text>
          <Text style={styles.sectionSubtitle}>
            Tap on a working day to set availability
          </Text>
          
          <View style={styles.weekGrid}>
            {currentWeek.map((day) => (
              <DayCard key={day.date} day={day} />
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
            <Text style={styles.instructionText}>
              Select a doctor from the list above
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="time-outline" size={20} color="#007AFF" />
            <Text style={styles.instructionText}>
              Tap on a working day to set time slots
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.instructionText}>
              Toggle individual time slots on/off
            </Text>
          </View>
        </View>
      </ScrollView>

      <AvailabilityModal />
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  doctorSelection: {
    flexDirection: 'row',
    gap: 12,
  },
  doctorChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 120,
    alignItems: 'center',
  },
  selectedDoctorChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  doctorChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedDoctorChipText: {
    color: '#fff',
  },
  doctorChipSpecialty: {
    fontSize: 12,
    color: '#666',
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayCard: {
    width: '30%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDayCard: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  weekendCard: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
  dayDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedDayText: {
    color: '#fff',
  },
  dayStatus: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  timeSlotsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  slotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availableSlot: {
    backgroundColor: '#34C759',
  },
  unavailableSlot: {
    backgroundColor: '#FF3B30',
  },
  moreSlotsText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
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
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  dateInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timeSlotsContainer: {
    marginBottom: 20,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  availableSlotRow: {
    backgroundColor: '#f0f9ff',
    borderColor: '#34C759',
  },
  unavailableSlotRow: {
    backgroundColor: '#fff5f5',
    borderColor: '#FF3B30',
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timeSlotDuration: {
    fontSize: 14,
    color: '#666',
  },
  availabilityIndicator: {
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 20,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  quickActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#fff',
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
