import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Colors } from '../../constants/Colours';
import Card from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { signOut, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { router } from 'expo-router'; // Make sure router is imported

// Define the UserData interface based on your Firestore structure
interface UserData {
  name: string;
  email: string;
  profileImageUrl?: string;
  targetWeight: number | null;
  currentWeight: number | null;
}

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [targetWeightInput, setTargetWeightInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as UserData;
        setUserData(data);
        setTargetWeightInput(data.targetWeight ? String(data.targetWeight) : '');
      } else {
        console.log("No user data found in Firestore for this UID.");
        setUserData({
          name: currentUser?.displayName || 'Guest User',
          email: currentUser?.email || 'N/A',
          profileImageUrl: currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'User')}&background=A020F0&color=FFFFFF&size=100`,
          targetWeight: null,
          currentWeight: null
        });
        setTargetWeightInput('');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTargetWeight = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to save weight.');
      return;
    }
    setSaving(true);
    try {
      const weight = parseFloat(targetWeightInput);
      if (isNaN(weight) || weight <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid target weight.');
        setSaving(false);
        return;
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        targetWeight: weight,
        lastUpdated: new Date().toISOString(),
      });
      setUserData(prev => prev ? { ...prev, targetWeight: weight } : null);
      Alert.alert('Success', 'Target weight saved!');
    } catch (error: any) {
      console.error('Error saving target weight:', error.message);
      Alert.alert('Error', 'Failed to save target weight.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have been logged out successfully.');
      // THIS IS THE CRUCIAL LINE FOR REDIRECTION
      router.replace('/login'); // Redirect to login screen after logout
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert('Logout Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of your component and styles remain the same) ...
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.userName}>Please log in to view your profile.</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('./login')}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Profile</Text>

        {/* User Info Card */}
        <Card style={styles.profileCard}>
          {userData?.profileImageUrl ? (
            <Image source={{ uri: userData.profileImageUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={50} color={Colors.primaryText} />
            </View>
          )}
          <Text style={styles.userName}>{userData?.name || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'Not logged in'}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            <Ionicons name="create-outline" size={18} color={Colors.primaryText} />
          </TouchableOpacity>
        </Card>

        {/* Weight Goals Card */}
        <Card>
          <Text style={styles.cardTitle}>Weight Goals</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Weight:</Text>
            <Text style={styles.infoValue}>{userData?.currentWeight ? `${userData.currentWeight} kg` : 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Target Weight:</Text>
            <Text style={styles.infoValue}>{userData?.targetWeight ? `${userData.targetWeight} kg` : 'Not set'}</Text>
          </View>

          <View style={styles.lineBreak} />

          <Text style={styles.inputLabel}>Update Target Weight:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 75"
            placeholderTextColor={Colors.secondaryText}
            keyboardType="numeric"
            value={targetWeightInput}
            onChangeText={setTargetWeightInput}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveTargetWeight} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.primaryText} />
            ) : (
              <Text style={styles.buttonText}>Save Target Weight</Text>
            )}
          </TouchableOpacity>
        </Card>


        {/* Settings Options */}
        <Card>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="cog-outline" size={24} color={Colors.secondaryText} />
            <Text style={styles.settingText}>Account Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
          </TouchableOpacity>
          <View style={styles.lineBreak} />
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="barbell-outline" size={24} color={Colors.secondaryText} />
            <Text style={styles.settingText}>Fitness Goals (More)</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
          </TouchableOpacity>
          <View style={styles.lineBreak} />
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="color-palette-outline" size={24} color={Colors.secondaryText} />
            <Text style={styles.settingText}>App Theme</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondaryText} />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
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
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryText,
    margin: 16,
    marginTop: 20,
  },
  profileCard: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.secondaryText,
    marginBottom: 15,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  editProfileButtonText: {
    color: Colors.primaryText,
    fontSize: 16,
    marginRight: 5,
  },
  lineBreak: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
    marginHorizontal: -16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primaryText,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.secondaryText,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primaryText,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.primaryText,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: Colors.primaryText,
    marginBottom: 15,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  saveButton: {
    width: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingText: {
    flex: 1,
    fontSize: 17,
    color: Colors.primaryText,
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.red,
    fontSize: 18,
    fontWeight: '600',
  },
});