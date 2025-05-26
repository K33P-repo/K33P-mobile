import Button from '@/components/Button';
import useCustomFonts from '@/hooks/useCustomFonts';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, View } from 'react-native';
import logoImage from './../assets/images/K33P.png';
import topImage from './../assets/images/top-mask.png';
import './global.css';

export default function Index() {
  const router = useRouter();
  const { fontsLoaded, onLayoutRootView } = useCustomFonts();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-black" onLayout={onLayoutRootView}>
      {/* Top Image Section */}
      <View className="w-full">
        <Image source={topImage} resizeMode="cover" />
      </View>

      {/* Logo in the center */}
      <View className="absolute inset-0 justify-center items-center">
        <Image source={logoImage} />
      </View>

      {/* Buttons at the bottom */}
      <View className="w-full absolute bottom-10 px-6 gap-y-4">
        <Button text="Login" onPress={() => router.push('/sign-in')} outline />
        <Button text="Create Account" onPress={() => router.push('/sign-up')} />
{        <Button text="Home" onPress={() => router.push('/(home)')} />
}      </View>
    </SafeAreaView>
  );
}
