// FitzFrontend/app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { SplashScreen, Stack, useRouter, useSegments, Slot } from 'expo-router'; // Added Slot
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Colors } from '../constants/Colours';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

// Custom hook to provide user state
const AuthContext = React.createContext<User | null | undefined>(undefined);
export const useUser = () => React.useContext(AuthContext);

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAppReady(true);
      SplashScreen.hideAsync();
    });

    return () => unsubscribe();
  }, []);

  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  // Define a temporary component to hold the conditional navigation
  const ConditionalRootNavigator = () => {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
      // Check if user is null (unauthenticated) AND we are NOT in the (auth) group
      if (user === null && segments[0] !== 'auth') {
        router.replace('/auth/login');
      }
      // Check if user is logged in AND we are NOT in the (tabs) group
      else if (user && segments[0] !== '(tabs)') {
        router.replace('/(tabs)');
      }
    }, [user, segments, router]);

    // Render a Slot here. This Slot will render the active route group ((auth) or (tabs))
    // based on the router.replace() calls above.
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/*
          The InitialRedirect logic is now integrated directly into this component.
          We don't need explicit Stack.Screen for (auth) or (tabs) here.
          The Slot will automatically render the correct route based on the URL.
        */}
        <Slot />
        {/* Other common screens like a modal could go here, accessible from both groups */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    );
  };

  return (
    <AuthContext.Provider value={user}>
      <SafeAreaProvider>
        <ConditionalRootNavigator />
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}