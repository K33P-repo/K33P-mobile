import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackButton from '../../../../assets/images/back.png';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleNameChange = (text: string) => {
    setName(text);
    setIsValid(text.length >= 3);
    setIsTouched(true);
  };

  const handleProceed = () => {
    if (isValid) {
      console.log('Entered name:', name);
      router.push('/(home)');
    }
  };

  const showError = isTouched && !isValid && name.length > 0;

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

      {/* Content */}
      <View className="flex-1">
        <Text className="text-white font-sora text-sm mb-4">
          What would you like to be Called
        </Text>

        <TextInput
          className={`rounded-lg px-5 py-3 mb-2 ${
            showError ? 'border-error500' : 'border-neutral200'
          } font-sora text-sm text-white border`}
          placeholder="Enter a Name or Nick-name"
          placeholderTextColor="#969696"
          value={name}
          onChangeText={handleNameChange}
          maxLength={30}
          autoCapitalize="words"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="done"
          onSubmitEditing={handleProceed}
        />

        {showError && (
          <Text className="text-error500 font-sora text-sm p-2">
            Name must be at least 3 characters
          </Text>
        )}
      </View>

      {/* Footer */}
      <View className="pb-8">
        <Button
          text="Proceed"
          onPress={handleProceed}
          isDisabled={!isValid}
        />
      </View>
    </KeyboardAvoidingView>
  );
}