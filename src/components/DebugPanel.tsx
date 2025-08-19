import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export const DebugPanel: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
  const [loading, setLoading] = useState(false);
  
  const { checkUsersTable, createUserProfile } = useAuth();

  const handleCheckTable = async () => {
    setLoading(true);
    try {
      const result = await checkUsersTable();
      if (result.accessible) {
        Alert.alert('Success', 'Users table is accessible');
      } else {
        Alert.alert('Error', `Users table not accessible: ${result.error?.message}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to check table: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!userId || !name) {
      Alert.alert('Error', 'Please enter User ID and Name');
      return;
    }

    setLoading(true);
    try {
      const result = await createUserProfile(userId, name, phone, role);
      if (result.success) {
        Alert.alert('Success', 'User profile created successfully');
        setUserId('');
        setName('');
        setPhone('');
      } else {
        Alert.alert('Error', `Failed to create profile: ${result.error?.message}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to create profile: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Panel</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleCheckTable}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Checking...' : 'Check Users Table'}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Manual Profile Creation</Text>
      
      <TextInput
        style={styles.input}
        placeholder="User ID (UUID)"
        value={userId}
        onChangeText={setUserId}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
      />
      
      <View style={styles.roleContainer}>
        {(['patient', 'doctor', 'admin'] as const).map((roleOption) => (
          <TouchableOpacity
            key={roleOption}
            style={[
              styles.roleButton,
              role === roleOption && styles.roleButtonActive
            ]}
            onPress={() => setRole(roleOption)}
          >
            <Text style={[
              styles.roleText,
              role === roleOption && styles.roleTextActive
            ]}>
              {roleOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateProfile}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Profile'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#34495e',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f8f9fa',
  },
  roleButtonActive: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  roleTextActive: {
    color: '#3498db',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
});
