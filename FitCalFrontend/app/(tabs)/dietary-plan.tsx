// FitzFrontend/app/(tabs)/dietary-plan.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Colors } from '../../constants/Colours';
import Card from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router'; // Import useFocusEffect for re-fetching when screen is focused
import AsyncStorage from '@react-native-async-storage/async-storage'; // To store/retrieve the plan locally

// Define interfaces for meal and dietary plan structure
interface MealItem {
  name: string;
  description: string;
  calories?: number; // Make optional if not always present or directly parsed
  protein?: number;
  carbs?: number;
  fats?: number;
  image_url?: string;
}

interface DailyPlan {
  day: string;
  meals: {
    breakfast: MealItem;
    lunch: MealItem;
    dinner: MealItem;
    snacks: MealItem[];
  };
}

// Helper to generate a placeholder image URL based on meal name
const generateImageUrl = (mealName: string) => {
  const query = encodeURIComponent(mealName + " food");
  return `https://source.unsplash.com/featured/?${query}&${Math.random()}`; // Random for varied images
};

// Function to parse the AI's text response into the DailyPlan structure
const parseAiPlanResponse = (aiTextResponse: string, numDays: number): DailyPlan[] => {
  const parsedPlans: DailyPlan[] = [];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Split the response into daily sections
  // Look for "Day X:" or similar markers for each day
  const daySections = aiTextResponse.split(/(Day \d+:|DAY \d+:)/i).filter(Boolean);

  let currentDayIndex = 0;

  for (let i = 0; i < daySections.length; i++) {
    const sectionTitle = daySections[i];
    if (sectionTitle.toLowerCase().startsWith('day')) {
      // The actual content for the day is in the next section
      const dayContent = daySections[i + 1] || '';
      const dayName = daysOfWeek[currentDayIndex % 7]; // Cycle through days

      const newDailyPlan: DailyPlan = {
        day: dayName,
        meals: {
          breakfast: { name: 'N/A', description: 'No breakfast plan provided.' },
          lunch: { name: 'N/A', description: 'No lunch plan provided.' },
          dinner: { name: 'N/A', description: 'No dinner plan provided.' },
          snacks: [],
        },
      };

      // Extract Breakfast
      const breakfastMatch = dayContent.match(/Breakfast:\s*(.*?)(?=\n(?:Lunch|Dinner|Snacks|$))/is);
      if (breakfastMatch && breakfastMatch[1]) {
        const [name, description] = breakfastMatch[1].split(': ', 2);
        newDailyPlan.meals.breakfast = {
          name: name ? name.trim() : 'Breakfast',
          description: description ? description.trim() : breakfastMatch[1].trim(),
          image_url: generateImageUrl(name ? name.trim() : 'Breakfast'),
        };
      }

      // Extract Lunch
      const lunchMatch = dayContent.match(/Lunch:\s*(.*?)(?=\n(?:Dinner|Snacks|$))/is);
      if (lunchMatch && lunchMatch[1]) {
        const [name, description] = lunchMatch[1].split(': ', 2);
        newDailyPlan.meals.lunch = {
          name: name ? name.trim() : 'Lunch',
          description: description ? description.trim() : lunchMatch[1].trim(),
          image_url: generateImageUrl(name ? name.trim() : 'Lunch'),
        };
      }

      // Extract Dinner
      const dinnerMatch = dayContent.match(/Dinner:\s*(.*?)(?=\n(?:Snacks|$))/is);
      if (dinnerMatch && dinnerMatch[1]) {
        const [name, description] = dinnerMatch[1].split(': ', 2);
        newDailyPlan.meals.dinner = {
          name: name ? name.trim() : 'Dinner',
          description: description ? description.trim() : dinnerMatch[1].trim(),
          image_url: generateImageUrl(name ? name.trim() : 'Dinner'),
        };
      }

      // Extract Snacks
      const snacksMatch = dayContent.match(/Snacks:\s*(.*?)(?=\n(?:Workout Plan|$))/is);
      if (snacksMatch && snacksMatch[1]) {
        const snackLines = snacksMatch[1].split('\n').filter(line => line.trim().length > 0 && !line.includes('Workout Plan'));
        newDailyPlan.meals.snacks = snackLines.map(line => {
          const [name, description] = line.replace(/^- /, '').split(': ', 2);
          return {
            name: name ? name.trim() : 'Snack',
            description: description ? description.trim() : line.trim(),
            image_url: generateImageUrl(name ? name.trim() : 'Snack'),
          };
        });
      }

      parsedPlans.push(newDailyPlan);
      currentDayIndex++;
      i++; // Skip the content section as it's processed
      if (parsedPlans.length >= numDays) break; // Stop if we have enough days
    }
  }

  // Fallback if parsing fails or plan is incomplete
  while (parsedPlans.length < numDays) {
    const dayName = daysOfWeek[parsedPlans.length % 7];
    parsedPlans.push({
      day: dayName,
      meals: {
        breakfast: { name: 'No Plan', description: 'Still working on this meal!' },
        lunch: { name: 'No Plan', description: 'Still working on this meal!' },
        dinner: { name: 'No Plan', description: 'Still working on this meal!' },
        snacks: [],
      },
    });
  }

  return parsedPlans;
};


// Backend API URL 
const API_BASE_URL = 'http://localhost:5089/api'; // Or your deployed backend URL

export default function DietaryPlanScreen() {
  const [dietPlan, setDietPlan] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // This will store the raw AI response text and the parameters used to generate it
  const [lastGeneratedPlanRaw, setLastGeneratedPlanRaw] = useState<{ text: string, params: any } | null>(null);

  const fetchDietPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedPlan = await AsyncStorage.getItem('lastGeneratedDietPlan');
      if (storedPlan) {
        const { text, params } = JSON.parse(storedPlan);
        const parsedPlan = parseAiPlanResponse(text, params.DaysPerWeek || 5);
        setDietPlan(parsedPlan);
        setLastGeneratedPlanRaw({ text, params });
        setLoading(false);
        return;
      }

      // If no stored plan, you might want to prompt the user to generate one
      // or fetch a default/example plan if available. For now, we'll show no plan.
      setDietPlan([]);
      setLoading(false);

    } catch (e: any) {
      console.error('Failed to load stored diet plan:', e);
      setError('Failed to load stored plan.');
      setDietPlan([]);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDietPlan(); // Refetch when the screen comes into focus
    }, [fetchDietPlan])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDietPlan();
  }, [fetchDietPlan]);


  const renderMealItem = (meal: MealItem, mealType: string) => (
    <View style={styles.mealItemContainer}>
      {meal.image_url ? (
        <Image source={{ uri: meal.image_url }} style={styles.mealImage} />
      ) : (
        <View style={styles.mealImagePlaceholder}>
          <Ionicons name="nutrition" size={24} color={Colors.primaryText} />
        </View>
      )}
      <View style={styles.mealDetails}>
        <Text style={styles.mealType}>{mealType}</Text>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealDescription}>{meal.description}</Text>
        {/* Only show macros if available (not directly from AI text parsing yet) */}
        {(meal.calories || meal.protein || meal.carbs || meal.fats) ? (
          <Text style={styles.mealMacros}>
            {meal.calories || '?'} kcal • P:{meal.protein || '?'}g C:{meal.carbs || '?'}g F:{meal.fats || '?'}g
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading your dietary plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={32} color={Colors.red} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.smallText}>Failed to load dietary plan.</Text>
          <TouchableOpacity style={styles.generatePlanButton} onPress={() => router.push('./workouts')}>
            <Text style={styles.generatePlanButtonText}>Generate New Plan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentDayPlan = dietPlan[selectedDayIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
            titleColor={Colors.accent}
          />
        }
      >
        <Text style={styles.header}>Your Dietary Plan</Text>

        {dietPlan.length === 0 || !currentDayPlan ? (
          <Card style={styles.noPlanCard}>
            <Ionicons name="restaurant-outline" size={40} color={Colors.secondaryText} />
            <Text style={styles.noPlanText}>No dietary plan found.</Text>
            <Text style={styles.smallText}>Generate a new plan to get personalized meal suggestions!</Text>
            <TouchableOpacity style={styles.generatePlanButton} onPress={() => router.push('./workouts')}>
              <Text style={styles.generatePlanButtonText}>Generate Plan</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {/* Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelectorContainer}>
              {dietPlan.map((plan, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayButton, index === selectedDayIndex && styles.dayButtonSelected]}
                  onPress={() => setSelectedDayIndex(index)}
                >
                  <Text style={[styles.dayButtonText, index === selectedDayIndex && styles.dayButtonTextSelected]}>
                    {plan.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {currentDayPlan && (
              <View>
                <Card style={styles.daySummaryCard}>
                  <Text style={styles.dayTitle}>{currentDayPlan.day}'s Meals</Text>
                  {lastGeneratedPlanRaw?.params && (
                    <Text style={styles.targetInfo}>
                      Goal: {lastGeneratedPlanRaw.params.CurrentWeightKg}kg to {lastGeneratedPlanRaw.params.TargetWeightKg}kg in {lastGeneratedPlanRaw.params.DaysPerWeek} days/week workouts
                    </Text>
                  )}
                </Card>

                <Card>
                  {renderMealItem(currentDayPlan.meals.breakfast, "Breakfast")}
                </Card>

                <Card>
                  {renderMealItem(currentDayPlan.meals.lunch, "Lunch")}
                </Card>

                <Card>
                  {renderMealItem(currentDayPlan.meals.dinner, "Dinner")}
                </Card>

                {currentDayPlan.meals.snacks.length > 0 && (
                  <Card>
                    <Text style={styles.snacksHeader}>Snacks</Text>
                    {currentDayPlan.meals.snacks.map((snack, index) => (
                      <View key={index}>
                        {renderMealItem(snack, `Snack ${index + 1}`)}
                        {index < currentDayPlan.meals.snacks.length - 1 && <View style={styles.snackSeparator} />}
                      </View>
                    ))}
                  </Card>
                )}
                <TouchableOpacity style={styles.generatePlanButton} onPress={() => router.push('./workouts')}>
                    <Ionicons name="add-circle-outline" size={24} color={Colors.primaryText} />
                    <Text style={styles.generatePlanButtonText}>Generate New Plan</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.primaryText,
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.red,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  smallText: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 5,
  },
  noPlanCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    marginHorizontal: 16,
    marginTop: 20,
  },
  noPlanText: {
    color: Colors.primaryText,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  generatePlanButton: {
    backgroundColor: Colors.accent, // Changed to accent for consistency
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    marginHorizontal: 16, // Added for consistency
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatePlanButtonText: {
    color: Colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Day Selector Styles
  daySelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
  },
  dayButton: {
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dayButtonText: {
    color: Colors.primaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: Colors.background, // Text color changes when selected
    fontWeight: 'bold',
  },
  // Plan Display Styles
  daySummaryCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 15,
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primaryText,
    marginBottom: 5,
  },
  targetInfo: {
    fontSize: 16,
    color: Colors.secondaryText,
    fontStyle: 'italic',
  },
  mealItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  mealImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealDetails: {
    flex: 1,
  },
  mealType: {
    fontSize: 12,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  mealDescription: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  mealMacros: {
    fontSize: 12,
    color: Colors.accent,
    marginTop: 5,
    fontWeight: '600',
  },
  snacksHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryText,
    marginBottom: 10,
    paddingHorizontal: 10, // Adjust padding to align with meal items
    paddingTop: 5,
  },
  snackSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 5,
    marginHorizontal: 10,
  }
});