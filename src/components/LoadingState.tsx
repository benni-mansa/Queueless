import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import {
  CardSkeleton,
  AppointmentCardSkeleton,
  DoctorCardSkeleton,
  ListItemSkeleton,
  FormFieldSkeleton,
  ButtonSkeleton,
  DashboardStatsSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  CalendarSkeleton,
  TimeSlotsSkeleton,
  SearchBarSkeleton,
  NavigationSkeleton,
  LoadingScreenSkeleton,
} from './LoadingSkeletons';

export type LoadingType = 
  | 'card'
  | 'appointment'
  | 'doctor'
  | 'list'
  | 'form'
  | 'button'
  | 'dashboard'
  | 'table'
  | 'profile'
  | 'calendar'
  | 'timeSlots'
  | 'search'
  | 'navigation'
  | 'screen'
  | 'spinner';

interface LoadingStateProps {
  type: LoadingType;
  count?: number;
  message?: string;
  showSpinner?: boolean;
  style?: any;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  count = 1,
  message,
  showSpinner = false,
  style,
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return Array.from({ length: count }).map((_, index) => (
          <CardSkeleton key={index} />
        ));
      case 'appointment':
        return Array.from({ length: count }).map((_, index) => (
          <AppointmentCardSkeleton key={index} />
        ));
      case 'doctor':
        return Array.from({ length: count }).map((_, index) => (
          <DoctorCardSkeleton key={index} />
        ));
      case 'list':
        return Array.from({ length: count }).map((_, index) => (
          <ListItemSkeleton key={index} />
        ));
      case 'form':
        return Array.from({ length: count }).map((_, index) => (
          <FormFieldSkeleton key={index} />
        ));
      case 'button':
        return Array.from({ length: count }).map((_, index) => (
          <ButtonSkeleton key={index} />
        ));
      case 'dashboard':
        return <DashboardStatsSkeleton />;
      case 'table':
        return <TableSkeleton />;
      case 'profile':
        return <ProfileSkeleton />;
      case 'calendar':
        return <CalendarSkeleton />;
      case 'timeSlots':
        return <TimeSlotsSkeleton />;
      case 'search':
        return <SearchBarSkeleton />;
      case 'navigation':
        return <NavigationSkeleton />;
      case 'screen':
        return <LoadingScreenSkeleton />;
      case 'spinner':
        return (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
        );
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {showSpinner && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      {renderSkeleton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoadingState;
