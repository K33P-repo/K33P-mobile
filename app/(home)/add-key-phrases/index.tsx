import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import BackButton from '../../../assets/images/back.png';

export default function AddKey() {
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-neutral800 px-5 pt-12"
    >
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
          <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
        </TouchableOpacity>
      </View>


      {/* Footer */}
      <View className="pb-8">
        <Button
          text="Done"
          onPress={() => router.push('/(home)')}
          isDisabled={!isValid}
        />
      </View>
    </KeyboardAvoidingView>
  );
}