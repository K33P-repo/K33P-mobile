import Button from '@/components/Button';
import useCustomFonts from '@/hooks/useCustomFonts';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, SafeAreaView, View } from 'react-native';
import logoImage from './../assets/images/K33P.png';
import './global.css';

export default function Index() {
  const router = useRouter();
  const { fontsLoaded, onLayoutRootView } = useCustomFonts();
  const videoRef = useRef(null);
  const [showButtons, setShowButtons] = useState(false);
  const slideAnim = useRef(new Animated.Value(100)).current; 

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButtons(true);
      // Animate buttons sliding up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 4000); // 4 seconds delay

    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-black" onLayout={onLayoutRootView}>
      {/* Top Video Section */}
      <View className="w-full h-[300px] overflow-hidden">
        <Video
          ref={videoRef}
          source={require('../assets/animation/numbers.mp4')}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay
          isLooping
          useNativeControls={false}
          style={{ width: '100%', height: '100%' }}
        />
      </View>

      {/* Logo in the center */}
      <View className="absolute inset-0 justify-center items-center">
        <Image source={logoImage} />
      </View>

      <Animated.View 
        className="w-full absolute bottom-10 px-6 gap-y-4"
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: showButtons ? 1 : 0, 
        }}
      >
        <Button text="Login" onPress={() => router.push('/sign-in')} outline />
        <Button text="Create Account" onPress={() => router.push('/sign-up')} />
      </Animated.View>
    </SafeAreaView>
  );
}