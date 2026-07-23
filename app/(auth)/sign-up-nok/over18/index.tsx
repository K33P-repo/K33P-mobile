import { BackIcon, OVER18_0 } from '@/assets/images/svg';
import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { useNokPhoneStore } from '@/store/useNokPhoneScreen';
import { sendOTP } from '@/utils/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function NokPhoneEntryScreen() {
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    nokPhoneNumber, 
    nokFormattedNumber,
    setNokPhoneNumber,
    setNokFormattedNumber
  } = useNokPhoneStore();
  
  useEffect(() => {
    if (nokPhoneNumber.length > 0) {
      let formatted = '+';
      formatted += nokPhoneNumber.substring(0, 3);
      if (nokPhoneNumber.length > 3) formatted += '-' + nokPhoneNumber.substring(3, 6);
      if (nokPhoneNumber.length > 6) formatted += '-' + nokPhoneNumber.substring(6, 10);
      if (nokPhoneNumber.length > 10) formatted += '-' + nokPhoneNumber.substring(10, 13);
      setNokFormattedNumber(formatted);
    } else {
      setNokFormattedNumber('');
    }
  }, [nokPhoneNumber, setNokFormattedNumber]);

  const handlePhoneChange = (text: string) => {
    const cleanedNumber = text.replace(/\D/g, '');
    setNokPhoneNumber(cleanedNumber);
    setIsValid(/^234[0-9]{10}$/.test(cleanedNumber));
    setIsTouched(true);
  };

  const handleKeyPress = (num: string) => {
    const newNumber = nokPhoneNumber + num; 
    if (newNumber.length <= 13) {
      setNokPhoneNumber(newNumber); 
      setIsValid(/^234[0-9]{10}$/.test(newNumber));
      setIsTouched(true);
    }
  };

  useEffect(() => {
    setIsValid(/^234[0-9]{10}$/.test(nokPhoneNumber));
  }, [nokPhoneNumber]);

  const handleBackspace = () => {
    const newNumber = nokPhoneNumber.slice(0, -1);
    setNokPhoneNumber(newNumber); 
    setIsValid(/^234[0-9]{10}$/.test(newNumber));
    setIsTouched(true);
  };

  const handleProceed = async () => {
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await sendOTP(nokPhoneNumber);
      router.push('/(auth)/sign-up-nok/over18/otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showError = isTouched && !isValid && nokPhoneNumber.length > 0;

  return (
    <View className="flex-1 px-5">
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
          <BackIcon width={40} height={40} />

        </TouchableOpacity>
        <OVER18_0 
        style={{
          position: 'absolute',
          left: '50%',
          transform: [{ translateX: '-50%' }]
        }}
      />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-white font-sora text-sm mb-4">
          Enter NOK Phone Number
        </Text>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowKeypad(true);
            Keyboard.dismiss();
            setIsFocused(true);
          }}
        >
          <View pointerEvents="none">
            <TextInput
              className={`rounded-lg px-5 py-3 mb-2 ${
                showError ? 'text-error500' : 'text-white'
              } font-sora text-sm mb-1 border ${
                isFocused ? 'border-white' : 'border-neutral200'
              }`}
              placeholder="+234-801-2345-678"
              placeholderTextColor="#969696"
              keyboardType="phone-pad"
              value={nokFormattedNumber}
              onChangeText={handlePhoneChange}
              maxLength={18}
              showSoftInputOnFocus={false}
              onFocus={() => {
                setShowKeypad(true);
                setIsFocused(true);
              }}
            />
          </View>
        </TouchableOpacity>

        {showError && !error && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            Phone number must start with 234 and be exactly 13 digits
          </Text>
        )}

        {error && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            {error}
          </Text>
        )}
      </View>

      <View className={`pb-16 ${showKeypad ? 'mb-80' : ''}`}>
        <Button
          text={isLoading ? "Sending OTP..." : "Proceed"}
          onPress={handleProceed}
          isDisabled={!isValid || isLoading}
        />
      </View>

      {/* Keypad Handling */}
      {showKeypad && (
        <TouchableWithoutFeedback
          onPress={() => {
            setShowKeypad(false);
            setIsFocused(false);
          }}
        >
          <View className="absolute top-0 left-0 right-0 bottom-80" />
        </TouchableWithoutFeedback>
      )}

      <NumericKeypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        isVisible={showKeypad}
      />
    </View>
  );
}