import useCustomFonts from '@/hooks/useCustomFonts';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import './global.css';

export default function RootLayout() {
  const { fontsLoaded } = useCustomFonts(); // ✅ fix destructure
  const [showSplash, setShowSplash] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    if (fontsLoaded) {
      SplashScreen.hideAsync();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fadeAnim]);

  return (
    <View className="flex-1 bg-black">
      {showSplash && (
        <Animated.View
          className="absolute inset-0 bg-black z-50"
          style={{ opacity: fadeAnim }}
        />
      )}

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </View>
  );
}
