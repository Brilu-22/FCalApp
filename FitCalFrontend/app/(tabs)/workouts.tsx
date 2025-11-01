// FitzFrontend/app/(tabs)/workouts.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { Colors } from '../../constants/Colours';
import Card from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// You'll need an image of a human silhouette.
// For demonstration, I'll use a placeholder. In a real app,
// you might have an SVG or a transparent PNG, and use absolute positioning
// or a library like react-native-image-mapper to create interactive zones.
// For simplicity, I'll just represent clickable areas.
const humanSilhouetteImage = 'https://via.placeholder.com/300x500/0D0D0D/FFFFFF?text=Human+Anatomy'; // Placeholder

export default function WorkoutsScreen() {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  const handleBodyPartSelect = (bodyPart: string) => {
    setSelectedBodyPart(bodyPart);
    Alert.alert(`Selected: ${bodyPart}`, `You've selected to focus on ${bodyPart}. We can now filter exercises or suggest a plan.`);
    // In a real app, you'd navigate or filter a list of exercises here
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Workouts</Text>

        {/* Current Workout/Plan Card */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Plan</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors.accent} />
            </TouchableOpacity>
          </View>
          <Text style={styles.workoutName}>Full Body Strength</Text>
          <Text style={styles.secondaryText}>3 days/week | Moderate Intensity</Text>
          <View style={styles.lineBreak} />
          <View style={styles.workoutStatsRow}>
            <View style={styles.workoutStatItem}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.smallText}>completed</Text>
            </View>
            <View style={styles.workoutStatItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.smallText}>remaining</Text>
            </View>
            <View style={styles.workoutStatItem}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.smallText}>weeks left</Text>
            </View>
          </View>
        </Card>

        {/* Human Anatomy Silhouette for Selection */}
        <Card style={styles.anatomyCard}>
          <Text style={styles.cardTitle}>Select Body Part to Exercise</Text>
          <View style={styles.silhouetteContainer}>
            <Image
              source={{ uri: humanSilhouetteImage }}
              style={styles.silhouetteImage}
              resizeMode="contain"
            />
            {/* Interactive overlay - these positions would be fine-tuned */}
            <TouchableOpacity
              style={[styles.bodyPartZone, styles.zoneHead]}
              onPress={() => handleBodyPartSelect('Shoulders')}
            ><Text style={styles.zoneText}>Shoulders</Text></TouchableOpacity>
            <TouchableOpacity
              style={[styles.bodyPartZone, styles.zoneChest]}
              onPress={() => handleBodyPartSelect('Chest')}
            ><Text style={styles.zoneText}>Chest</Text></TouchableOpacity>
            <TouchableOpacity
              style={[styles.bodyPartZone, styles.zoneArms]}
              onPress={() => handleBodyPartSelect('Arms')}
            ><Text style={styles.zoneText}>Arms</Text></TouchableOpacity>
            <TouchableOpacity
              style={[styles.bodyPartZone, styles.zoneCore]}
              onPress={() => handleBodyPartSelect('Core')}
            ><Text style={styles.zoneText}>Core</Text></TouchableOpacity>
            <TouchableOpacity
              style={[styles.bodyPartZone, styles.zoneLegs]}
              onPress={() => handleBodyPartSelect('Legs')}
            ><Text style={styles.zoneText}>Legs</Text></TouchableOpacity>
            <TouchableOpacity
              style={[styles.bodyPartZone, styles.zoneBack]}
              onPress={() => handleBodyPartSelect('Back')}
            ><Text style={styles.zoneText}>Back</Text></TouchableOpacity>
          </View>
          {selectedBodyPart && (
            <Text style={styles.selectedBodyPartText}>Selected: {selectedBodyPart}</Text>
          )}
        </Card>

        {/* Workout History/Calendar Card */}
        <Card>
          <Text style={styles.cardTitle}>History</Text>
          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>Mon, Oct 23</Text>
            <Text style={styles.historyDetails}>Upper Body - 45 min</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>Sat, Oct 21</Text>
            <Text style={styles.historyDetails}>Cardio & Abs - 30 min</Text>
          </View>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllButtonText}>See all workouts</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </Card>

        {/* Generate New Plan Button */}
        <TouchableOpacity style={styles.generatePlanButton}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.primaryText} />
          <Text style={styles.generatePlanButtonText}>Generate New Plan</Text>
        </TouchableOpacity>

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
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryText,
    margin: 16,
    marginTop: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryText,
    marginBottom: 10,
  },
  editButton: {
    padding: 4,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.accent,
    marginTop: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  lineBreak: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  workoutStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  workoutStatItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  smallText: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyDate: {
    fontSize: 16,
    color: Colors.primaryText,
    fontWeight: '500',
  },
  historyDetails: {
    fontSize: 14,
    color: Colors.secondaryText,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  seeAllButtonText: {
    color: Colors.accent,
    marginRight: 4,
    fontSize: 16,
  },
  generatePlanButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatePlanButtonText: {
    color: Colors.primaryText,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  anatomyCard: {
    alignItems: 'center',
  },
  silhouetteContainer: {
    width: 300,
    height: 500,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Colors.background, // For debugging zone visibility
  },
  silhouetteImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.8, // Make zones more visible
  },
  bodyPartZone: {
    position: 'absolute',
    backgroundColor: 'rgba(10, 132, 255, 0.3)', // Semi-transparent accent color
    borderRadius: 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.accent,
    borderWidth: 1,
  },
  zoneText: {
    color: Colors.primaryText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Example positions - these would require careful tuning based on your actual image
  zoneHead: { top: 10, left: '35%', width: '30%', height: 60 },
  zoneChest: { top: 120, left: '25%', width: '50%', height: 80 },
  zoneArms: { top: 180, left: 10, width: 80, height: 100 },
  zoneCore: { top: 220, left: '30%', width: '40%', height: 80 },
  zoneBack: { top: 200, right: 10, width: 80, height: 100 }, // Assuming we can show back or use front for general upper
  zoneLegs: { bottom: 20, left: '20%', width: '60%', height: 180 },
  selectedBodyPartText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.primaryText,
    fontWeight: 'bold',
  },
});