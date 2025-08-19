import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width: skeletonWidth = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: skeletonWidth,
          height,
          borderRadius,
          backgroundColor: '#E1E9EE',
          opacity,
        },
        style,
      ]}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <Skeleton width="60%" height={16} style={styles.cardTitle} />
    <Skeleton width="40%" height={14} style={styles.cardSubtitle} />
    <View style={styles.cardContent}>
      <Skeleton width="100%" height={12} style={styles.cardText} />
      <Skeleton width="80%" height={12} style={styles.cardText} />
    </View>
  </View>
);

// Appointment Card Skeleton
export const AppointmentCardSkeleton: React.FC = () => (
  <View style={styles.appointmentCard}>
    <View style={styles.appointmentHeader}>
      <Skeleton width={50} height={50} borderRadius={25} />
      <View style={styles.appointmentInfo}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
    <View style={styles.appointmentDetails}>
      <Skeleton width="100%" height={12} style={styles.detailLine} />
      <Skeleton width="80%" height={12} style={styles.detailLine} />
      <Skeleton width="60%" height={12} style={styles.detailLine} />
    </View>
  </View>
);

// Doctor Card Skeleton
export const DoctorCardSkeleton: React.FC = () => (
  <View style={styles.doctorCard}>
    <View style={styles.doctorHeader}>
      <Skeleton width={60} height={60} borderRadius={30} />
      <View style={styles.doctorInfo}>
        <Skeleton width="80%" height={18} />
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
    <View style={styles.doctorSpecialties}>
      <Skeleton width={80} height={24} borderRadius={12} style={styles.specialtyTag} />
      <Skeleton width={100} height={24} borderRadius={12} style={styles.specialtyTag} />
    </View>
  </View>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
  <View style={styles.listItem}>
    <Skeleton width={40} height={40} borderRadius={20} />
    <View style={styles.listItemContent}>
      <Skeleton width="70%" height={16} />
      <Skeleton width="50%" height={12} />
    </View>
    <Skeleton width={20} height={20} />
  </View>
);

// Form Field Skeleton
export const FormFieldSkeleton: React.FC = () => (
  <View style={styles.formField}>
    <Skeleton width="30%" height={14} style={styles.formLabel} />
    <Skeleton width="100%" height={48} borderRadius={8} />
  </View>
);

// Button Skeleton
export const ButtonSkeleton: React.FC = () => (
  <Skeleton width="100%" height={48} borderRadius={8} />
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton: React.FC = () => (
  <View style={styles.statsContainer}>
    <View style={styles.statCard}>
      <Skeleton width="60%" height={24} />
      <Skeleton width="40%" height={16} />
    </View>
    <View style={styles.statCard}>
      <Skeleton width="60%" height={24} />
      <Skeleton width="40%" height={16} />
    </View>
    <View style={styles.statCard}>
      <Skeleton width="60%" height={24} />
      <Skeleton width="40%" height={16} />
    </View>
  </View>
);

// Table Skeleton
export const TableSkeleton: React.FC = () => (
  <View style={styles.table}>
    <View style={styles.tableHeader}>
      <Skeleton width="25%" height={16} />
      <Skeleton width="25%" height={16} />
      <Skeleton width="25%" height={16} />
      <Skeleton width="25%" height={16} />
    </View>
    {[1, 2, 3, 4, 5].map((row) => (
      <View key={row} style={styles.tableRow}>
        <Skeleton width="25%" height={16} />
        <Skeleton width="25%" height={16} />
        <Skeleton width="25%" height={16} />
        <Skeleton width="25%" height={16} />
      </View>
    ))}
  </View>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <View style={styles.profile}>
    <Skeleton width={100} height={100} borderRadius={50} style={styles.profileAvatar} />
    <Skeleton width="60%" height={20} style={styles.profileName} />
    <Skeleton width="40%" height={16} style={styles.profileEmail} />
    <View style={styles.profileDetails}>
      <Skeleton width="100%" height={16} style={styles.profileDetail} />
      <Skeleton width="80%" height={16} style={styles.profileDetail} />
      <Skeleton width="60%" height={16} style={styles.profileDetail} />
    </View>
  </View>
);

// Calendar Skeleton
export const CalendarSkeleton: React.FC = () => (
  <View style={styles.calendar}>
    <View style={styles.calendarHeader}>
      <Skeleton width="40%" height={20} />
      <View style={styles.calendarNav}>
        <Skeleton width={24} height={24} />
        <Skeleton width={24} height={24} />
      </View>
    </View>
    <View style={styles.calendarGrid}>
      {Array.from({ length: 35 }).map((_, index) => (
        <Skeleton key={index} width={40} height={40} borderRadius={20} />
      ))}
    </View>
  </View>
);

// Time Slots Skeleton
export const TimeSlotsSkeleton: React.FC = () => (
  <View style={styles.timeSlots}>
    {Array.from({ length: 8 }).map((_, index) => (
      <Skeleton key={index} width={80} height={40} borderRadius={8} style={styles.timeSlot} />
    ))}
  </View>
);

// Search Bar Skeleton
export const SearchBarSkeleton: React.FC = () => (
  <View style={styles.searchBar}>
    <Skeleton width="100%" height={48} borderRadius={24} />
  </View>
);

// Navigation Skeleton
export const NavigationSkeleton: React.FC = () => (
  <View style={styles.navigation}>
    {Array.from({ length: 4 }).map((_, index) => (
      <View key={index} style={styles.navItem}>
        <Skeleton width={24} height={24} />
        <Skeleton width="60%" height={12} />
      </View>
    ))}
  </View>
);

// Loading Screen Skeleton
export const LoadingScreenSkeleton: React.FC = () => (
  <View style={styles.loadingScreen}>
    <Skeleton width={120} height={120} borderRadius={60} style={styles.loadingLogo} />
    <Skeleton width="60%" height={24} style={styles.loadingTitle} />
    <Skeleton width="40%" height={16} style={styles.loadingSubtitle} />
    <View style={styles.loadingContent}>
      <Skeleton width="100%" height={16} style={styles.loadingLine} />
      <Skeleton width="80%" height={16} style={styles.loadingLine} />
      <Skeleton width="60%" height={16} style={styles.loadingLine} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardSubtitle: {
    marginBottom: 12,
  },
  cardContent: {
    gap: 8,
  },
  cardText: {
    marginBottom: 4,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentInfo: {
    marginLeft: 12,
    flex: 1,
    gap: 4,
  },
  appointmentDetails: {
    gap: 8,
  },
  detailLine: {
    marginBottom: 4,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorInfo: {
    marginLeft: 12,
    flex: 1,
    gap: 4,
  },
  doctorSpecialties: {
    flexDirection: 'row',
    gap: 8,
  },
  specialtyTag: {
    marginRight: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 16,
    gap: 16,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 16,
  },
  profile: {
    alignItems: 'center',
    padding: 24,
  },
  profileAvatar: {
    marginBottom: 16,
  },
  profileName: {
    marginBottom: 8,
  },
  profileEmail: {
    marginBottom: 24,
  },
  profileDetails: {
    width: '100%',
    gap: 16,
  },
  profileDetail: {
    marginBottom: 8,
  },
  calendar: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  timeSlot: {
    marginBottom: 8,
  },
  searchBar: {
    padding: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingLogo: {
    marginBottom: 24,
  },
  loadingTitle: {
    marginBottom: 12,
  },
  loadingSubtitle: {
    marginBottom: 32,
  },
  loadingContent: {
    width: '100%',
    gap: 16,
  },
  loadingLine: {
    marginBottom: 8,
  },
});

export default Skeleton;
