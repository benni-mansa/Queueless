import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { BookAppointmentScreen } from '../screens/BookAppointmentScreen';
import { MyAppointmentsScreen } from '../screens/MyAppointmentsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import DoctorManagementScreen from '../screens/DoctorManagementScreen';
import AvailabilityManagementScreen from '../screens/AvailabilityManagementScreen';
import PatientManagementScreen from '../screens/PatientManagementScreen';
import AppointmentManagementScreen from '../screens/AppointmentManagementScreen';
import ServiceManagementScreen from '../screens/ServiceManagementScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Patient/Regular User Tabs
const PatientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
              <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="BookAppointment"
          component={BookAppointmentScreen}
          options={{
            tabBarLabel: 'Book',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MyAppointments"
          component={MyAppointmentsScreen}
          options={{
            tabBarLabel: 'Appointments',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
    </Tab.Navigator>
  );
};

// Admin Tabs
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
              <Tab.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="DoctorManagement"
          component={DoctorManagementScreen}
          options={{
            tabBarLabel: 'Doctors',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="medical" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="AvailabilityManagement"
          component={AvailabilityManagementScreen}
          options={{
            tabBarLabel: 'Schedule',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
    </Tab.Navigator>
  );
};

// Admin Stack Navigator (contains tabs + additional screens)
const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="PatientManagement" component={PatientManagementScreen} />
      <Stack.Screen name="AppointmentManagement" component={AppointmentManagementScreen} />
      <Stack.Screen name="ServiceManagement" component={ServiceManagementScreen} />
    </Stack.Navigator>
  );
};

// Doctor Tabs (for future use)
const DoctorTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#34C759',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      }}
    >
              <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Schedule',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  const getUserRole = () => {
    if (!user) return 'guest';
    return user.role || 'patient';
  };

  const MainComponent = () => {
    const role = getUserRole();
    
    switch (role) {
      case 'admin':
        return <AdminStack />;
      case 'doctor':
        return <DoctorTabs />;
      case 'patient':
      default:
        return <PatientTabs />;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainComponent} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
