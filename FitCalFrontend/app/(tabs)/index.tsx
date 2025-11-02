// FitzFrontend/app/(tabs)/home.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colours';
import Card from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../_layout'; // <--- This will now correctly import the hook

export default function HomeScreen() {
  const [currentDate, setCurrentDate] = useState('');
  const user = useUser(); // <--- Get the user object from context

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('en-US', options));
  }, []);

  // Determine the display name
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest';
  // Determine profile image URL, prioritizing photoURL from Firebase Auth, then Firestore (if you fetch it and store it in user object later), then a generated avatar
  const profileImageUrl = user?.photoURL || (user && `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=A020F0&color=FFFFFF&size=100`);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Top Header with Image Placeholder, Name, and Calendar */}
        <View style={styles.topHeaderContainer}>
          <View style={styles.leftHeader}>
            <Text style={styles.greetingText}>Thanks for Clocking It...</Text>
            <View style={styles.profileSection}>
              {profileImageUrl ? (
                <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
              <Text style={styles.userName}>{displayName}</Text>
            </View>
          </View>
          <View style={styles.calendarSection}>
            <Text style={styles.dateText}>{currentDate}</Text>
            <Ionicons name="calendar-outline" size={32} color={Colors.primaryText} />
          </View>
        </View>

        <Text style={styles.header}>Today</Text>

        {/* Daily Activity Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Ionicons name="walk-outline" size={24} color={Colors.primaryText} />
            <Text style={styles.cardTitle}>Daily Activity</Text>
          </View>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Text style={styles.activityNumber}>12,090</Text>
              <Text style={styles.secondaryText}>Steps</Text>
              <Text style={styles.smallText}>/15,000</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityNumber}>600</Text>
              <Text style={styles.secondaryText}>Calories</Text>
              <Text style={styles.smallText}>/2,000 kcal</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityNumber}>45</Text>
              <Text style={styles.secondaryText}>Activity Time</Text>
              <Text style={styles.smallText}>/60 min</Text>
            </View>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '80%' }]} />{/* Example width */}
          </View>
        </Card>

        {/* Weight Trend Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Ionicons name="pulse-outline" size={24} color={Colors.primaryText} />
            <Text style={styles.cardTitle}>Weight Trend</Text>
          </View>
          {/* Placeholder for a chart or more detailed trend */}
          <View style={{ height: 100, backgroundColor: Colors.background, borderRadius: 8, marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={styles.secondaryText}>Weight trend chart goes here</Text>
          </View>
          <View style={styles.lineBreak} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.secondaryText}>Current: {user?.currentWeight ? `${user.currentWeight} kg` : 'N/A'}</Text>
            <Text style={styles.secondaryText}>Target: {user?.targetWeight ? `${user.targetWeight} kg` : 'N/A'}</Text>
          </View>
        </Card>

        {/* Quick Log / Action Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Ionicons name="flash-outline" size={24} color={Colors.primaryText} />
            <Text style={styles.cardTitle}>Quick Log</Text>
          </View>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.accent }]}>
            <Ionicons name="barbell-outline" size={24} color={Colors.primaryText} />
            <Text style={styles.actionButtonText}>Log Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.background }]}>
            <Ionicons name="water-outline" size={24} color={Colors.primaryText} />
            <Text style={styles.actionButtonText}>Track Water</Text>
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    marginTop: 20,
  },
  leftHeader: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 16,
    color: Colors.secondaryText,
    marginBottom: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: { // New style for actual image
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: Colors.border,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  calendarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: Colors.primaryText,
    marginRight: 8,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryText,
    margin: 16,
    marginTop: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryText,
    marginLeft: 8,
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primaryText,
    marginTop: 4,
  },
  primaryText: {
    fontSize: 16,
    color: Colors.primaryText,
    marginTop: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  smallText: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  lineBreak: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  activityItem: {
    alignItems: 'center',
  },
  activityNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginTop: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  actionButtonText: {
    color: Colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  }
});