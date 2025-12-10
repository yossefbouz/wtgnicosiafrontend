import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';

import HomeScreen from './screens/HomeScreen';
import CyprusMapScreen from './screens/CyprusMapScreen';
import ProfileScreen from './screens/ProfileScreen';
import EventsScreen from './screens/EventsScreen';
import { SplashScreen as AppSplashScreen } from './screens/SplashScreen';
import BottomNav from './components/BottomNav';
import { COLORS } from './constants/theme';
import { AuthProvider } from './lib/authContext';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [showSplash, setShowSplash] = useState(true);

  let [fontsLoaded] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
  });

  useEffect(() => {
    let timer;
    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
      timer = setTimeout(() => setShowSplash(false), 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Map':
        return <CyprusMapScreen />;
      case 'Events':
        return <EventsScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          <StatusBar style="light" />
          {showSplash ? (
            <AppSplashScreen onFinish={() => setShowSplash(false)} />
          ) : (
            <>
              <View style={{ flex: 1 }}>
                {renderScreen()}
              </View>
              <View style={styles.bottomNavContainer}>
                <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
              </View>
            </>
          )}
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100, // Ensure it stays on top
  }
});
