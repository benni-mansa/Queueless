import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import LoadingState from '../components/LoadingState';

interface SignUpScreenProps {
  navigation: any;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { signUp } = useAuth();

  React.useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSignUp = async () => {
    console.log('🚀 [SIGNUP_SCREEN] Starting signup process...');
    console.log('🔍 [SIGNUP_SCREEN] Form data validation...');
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      console.error('❌ [SIGNUP_SCREEN] Validation failed: Missing required fields');
      console.error('❌ [SIGNUP_SCREEN] Field status:', { name: !!name, email: !!email, phone: !!phone, password: !!password, confirmPassword: !!confirmPassword });
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      console.error('❌ [SIGNUP_SCREEN] Validation failed: Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      console.error('❌ [SIGNUP_SCREEN] Validation failed: Password too short');
      console.error('❌ [SIGNUP_SCREEN] Password length:', password.length);
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    console.log('✅ [SIGNUP_SCREEN] Form validation passed');
    console.log('📝 [SIGNUP_SCREEN] Calling useAuth.signUp with data:', { email, name, phone, role, passwordLength: password.length });
    
    setLoading(true);
    try {
      console.log('🔄 [SIGNUP_SCREEN] Signup in progress...');
      const { error, data } = await signUp(email, password, name, phone, role);
      
      if (error) {
        console.error('❌ [SIGNUP_SCREEN] Signup failed with error:', error);
        console.error('❌ [SIGNUP_SCREEN] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        Alert.alert('Sign Up Failed', error?.message || 'Unknown error occurred');
      } else {
        console.log('✅ [SIGNUP_SCREEN] Signup successful');
        console.log('🔍 [SIGNUP_SCREEN] Signup response data:', data);
        Alert.alert(
          'Success',
          'Account created successfully! Please check your email for verification.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('🔄 [SIGNUP_SCREEN] Navigating to Login screen...');
                navigation.navigate('Login');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('💥 [SIGNUP_SCREEN] Unexpected error during signup:', error);
      console.error('💥 [SIGNUP_SCREEN] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      console.log('🏁 [SIGNUP_SCREEN] Signup process completed');
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper backgroundColor="#f5f5f5">
        <LoadingState type="form" count={6} />
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor="#f5f5f5">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Hospital Queue</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Select Role:</Text>
                <View style={styles.roleButtons}>
                  {(['patient', 'doctor', 'admin'] as const).map((roleOption) => (
                    <TouchableOpacity
                      key={roleOption}
                      style={[
                        styles.roleButton,
                        role === roleOption && styles.roleButtonActive,
                      ]}
                      onPress={() => setRole(roleOption)}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          role === roleOption && styles.roleButtonTextActive,
                        ]}
                      >
                        {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  Already have an account? Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: 'white',
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  roleButton: {
    flex: 1,
    padding: 15,
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
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  roleButtonTextActive: {
    color: '#3498db',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
    fontSize: 14,
  },
});
