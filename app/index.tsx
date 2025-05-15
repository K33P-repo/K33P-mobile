import { Button } from '@/components/Button';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, View } from 'react-native';

import './global.css';

// Import local images
import logoImage from './../assets/images/K33P.png';
import topImage from './../assets/images/top-mask.png';

export default function Index() {
  const router = useRouter();
  
  const handleSignIn = () => {
    console.log('Sign In pressed');
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    console.log('Sign Up pressed');
    // router.push('/(auth)/sign-up');
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Top Image Section */}
      <View className="w-full ">
        <Image 
          source={topImage} 
          resizeMode="cover" // Maintain the aspect ratio and cover the area
        />
      </View>

      {/* Logo in the center */}
      <View className="absolute inset-0 justify-center items-center">
        <Image 
          source={logoImage} 
        />
      </View>

      {/* Buttons at the bottom */}
      <View className="w-full absolute bottom-10 px-6 gap-y-4">
        <Link href="/(auth)/sign-in" asChild>
          <Button 
            text="Login" 
            onPress={handleSignIn} 
            outline={true} 
          />
        </Link>
        
        <Link href="/(auth)/sign-up" asChild>
          <Button 
            text="Create Account" 
            onPress={handleSignUp} 
          />
        </Link>
      </View>
    </SafeAreaView>
  );
}
