import { Button } from '@/components/Button';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import './global.css';


export default function Index() {
  const router = useRouter();
  // Mock functions for demonstration
  const handleSignIn = () => {
    console.log('Sign In pressed');
    // In a real app, navigate programmatically here
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    console.log('Sign Up pressed');
    // router.push('/(auth)/sign-up');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-red-100 p-4">
      <View className="flex-1 justify-center items-center">
        <View className="w-full items-center mb-8">
          <Text className="font-sora-bold text-2xl">Welcome to K33P</Text>
        </View>
        
        <View className="w-full max-w-xs gap-y-4">
          {/* Sign In Button */}
          <Link href="/(auth)/sign-in" asChild>
            <Button
              text="Sign In"
              onPress={handleSignIn}
              outline={false}
            />
          </Link>
          
          {/* Sign Up Button */}
          <Link href="/(auth)/sign-up" asChild>
            <Button
              text="Sign Up"
              onPress={handleSignUp}
              outline={true}
            />
          </Link>

          {/* Disabled State Example */}
          <Button
            text="Disabled Button"
            onPress={() => {}}
            isDisabled={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}