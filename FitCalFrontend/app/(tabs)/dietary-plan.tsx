import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/Colours';
import Card from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Define interfaces for meal and dietary plan structure
interface MealItem {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
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

// Dummy data for a dietary plan
const dummyDietaryPlan: DailyPlan[] = [
  {
    day: "Monday",
    meals: {
      breakfast: {
        name: "Oatmeal with Berries & Nuts",
        description: "Hearty oats cooked with water/milk, topped with mixed berries, sliced almonds, and a drizzle of honey.",
        calories: 350,
        protein: 10,
        carbs: 55,
        fats: 12,
        image_url: "https://images.unsplash.com/photo-1517431525-a13a00f27464?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      lunch: {
        name: "Grilled Chicken Salad",
        description: "Mixed greens, grilled chicken breast, cherry tomatoes, cucumber, bell peppers, light vinaigrette.",
        calories: 450,
        protein: 40,
        carbs: 20,
        fats: 20,
        image_url: "https://images.unsplash.com/photo-1512850183-6d7990f42383?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      dinner: {
        name: "Baked Salmon with Asparagus & Quinoa",
        description: "Oven-baked salmon fillet, steamed asparagus, and a side of fluffy quinoa.",
        calories: 550,
        protein: 45,
        carbs: 40,
        fats: 25,
        image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      snacks: [
        {
          name: "Greek Yogurt with Blueberries",
          description: "Plain Greek yogurt with fresh blueberries.",
          calories: 150,
          protein: 15,
          carbs: 15,
          fats: 2,
        },
        {
          name: "Handful of Almonds",
          description: "Approximately 1/4 cup of raw almonds.",
          calories: 180,
          protein: 6,
          carbs: 6,
          fats: 15,
        }
      ]
    }
  },
  {
    day: "Tuesday",
    meals: {
      breakfast: {
        name: "Scrambled Eggs with Spinach & Whole Wheat Toast",
        description: "Two scrambled eggs with sautéed spinach and one slice of whole wheat toast.",
        calories: 300,
        protein: 20,
        carbs: 25,
        fats: 12,
        image_url: "https://images.unsplash.com/photo-1525990263304-434863c0a525?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      lunch: {
        name: "Lentil Soup with Whole Grain Bread",
        description: "Hearty lentil soup, rich in fiber and protein, served with a slice of whole grain bread.",
        calories: 400,
        protein: 20,
        carbs: 60,
        fats: 10,
        image_url: "https://images.unsplash.com/photo-1608447040498-854746f33d76?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      dinner: {
        name: "Turkey Stir-fry with Brown Rice",
        description: "Lean ground turkey stir-fried with mixed vegetables (broccoli, carrots, snow peas) and soy sauce, served with brown rice.",
        calories: 500,
        protein: 40,
        carbs: 50,
        fats: 15,
        image_url: "https://images.unsplash.com/photo-1546931557-ad6d193d5f57?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      snacks: [
        {
          name: "Apple Slices with Peanut Butter",
          description: "One medium apple sliced with 2 tablespoons of natural peanut butter.",
          calories: 250,
          protein: 8,
          carbs: 25,
          fats: 15,
        }
      ]
    }
  }
  // Add more days as needed for a fuller dummy plan
];


export default function DietaryPlanScreen() {
  const [dietPlan, setDietPlan] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // For navigating between days

  useEffect(() => {
    const fetchDietPlan = () => {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        setDietPlan(dummyDietaryPlan);
        setLoading(false);
      }, 1500); // Simulate network delay
    };
    fetchDietPlan();
  }, []);

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
        <Text style={styles.mealMacros}>
          {meal.calories} kcal • P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g
        </Text>
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
        </View>
      </SafeAreaView>
    );
  }

  const currentDayPlan = dietPlan[selectedDayIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Your Dietary Plan</Text>

        {dietPlan.length === 0 ? (
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
                  <Text style={styles.targetInfo}>Target: Build Muscle (Example)</Text>
                  {/* Potentially show total macros for the day here */}
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
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  generatePlanButtonText: {
    color: Colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
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