import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { useClearBiometricSetup } from '@/store/useAuthStore';
import { usePhoneStore } from '@/store/usePhoneStore';
import { sendOTP } from '@/utils/api';
import { encryptPhoneData } from '@/utils/phoneEncyption';
import { useRouter } from 'expo-router';
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { BackIcon, Lock_1 } from '../../../assets/images/svg';

const MAX_PHONE_DIGITS = 15;

const isValidInternationalNumber = (digits: string): boolean => {
  if (!digits) return false;
  try {
    return isValidPhoneNumber(`+${digits}`);
  } catch {
    return false;
  }
};

const formatInternationalNumber = (digits: string): string => {
  if (!digits) return '';
  const formatter = new AsYouType();
  return formatter.input(`+${digits}`);
};

export default function PhoneEntryScreen() {
  const router = useRouter();
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    phoneNumber,
    formattedNumber,
    setPhoneNumber,
    setFormattedNumber,
  } = usePhoneStore();

  const clearBiometricSetup = useClearBiometricSetup();
  useEffect(() => {
    clearBiometricSetup();
  }, [clearBiometricSetup]);

  useEffect(() => {
    setFormattedNumber(formatInternationalNumber(phoneNumber));
  }, [phoneNumber, setFormattedNumber]);

  useEffect(() => {
    setIsValid(isValidInternationalNumber(phoneNumber));
  }, [phoneNumber]);

  const handlePhoneChange = (text: string) => {
    const cleanedNumber = text.replace(/\D/g, '');
    setPhoneNumber(cleanedNumber);
    setIsValid(isValidInternationalNumber(cleanedNumber));
    setIsTouched(true);
    setError(null);
  };

  const handleKeyPress = (num: string) => {
    const newNumber = phoneNumber + num;
    if (newNumber.length <= MAX_PHONE_DIGITS) {
      setPhoneNumber(newNumber);
      setIsValid(isValidInternationalNumber(newNumber));
      setIsTouched(true);
      setError(null);
    }
  };

  const handleBackspace = () => {
    const newNumber = phoneNumber.slice(0, -1);
    setPhoneNumber(newNumber);
    setIsValid(isValidInternationalNumber(newNumber));
    setIsTouched(true);
    setError(null);
  };

  const findUser = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 0));
      const phoneHash = await encryptPhoneData(phoneNumber);
      console.log('Encrypted phone number:', phoneHash.substring(0, 20) + '...');

      await new Promise(resolve => setTimeout(resolve, 0));
      const response = await fetch('https://k33p-backend-i9kj.onrender.com/api/zk/find-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneHash }),
      });

      const data = await response.json();
      console.log('Find user response:', data);

      if (data.success && data.data) {
        console.log('❌ User already exists');
        return true;
      } else {
        console.log('✅ Phone number available for sign-up');
        return false;
      }
    } catch (error) {
      console.error('Error finding user:', error);
      setError('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = async () => {
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setShowKeypad(false);

    setTimeout(async () => {
      const userExists = await findUser();
      if (userExists) {
        setError('Phone number already exists. Try another.');
        return;
      }
      try {
        await sendOTP(phoneNumber);
        setIsFocused(false);
        router.push('/sign-up/otp');
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP. Please try again.');
        setIsLoading(false);
      }
    }, 100);
  };

  const showValidationError = isTouched && !isValid && phoneNumber.length > 0;

  return (
    <View className="flex-1 px-5">
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()} disabled={isLoading}>
          <BackIcon width={40} height={40} />
        </TouchableOpacity>
        <Lock_1
          style={{
            position: 'absolute',
            left: '50%',
            transform: [{ translateX: '-50%' }]
          }}
        />
      </View>

      <View className="flex-1">
        <Text className="text-white font-sora text-sm mb-4">
          Enter Phone Number
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          disabled={isLoading}
          onPress={() => {
            setShowKeypad(true);
            Keyboard.dismiss();
            setIsFocused(true);
          }}
        >
          <View pointerEvents="none">
            <TextInput
              className={`rounded-lg px-5 py-3 mb-2 font-sora text-sm border ${showValidationError || error
                  ? 'text-error500 border-error500'
                  : 'text-white border-neutral200'
                } ${isFocused ? 'border-white' : ''}`}
              placeholder="+234 801 234 5678"
              placeholderTextColor="#969696"
              keyboardType="phone-pad"
              value={formattedNumber}
              onChangeText={handlePhoneChange}
              maxLength={20}
              showSoftInputOnFocus={false}
              editable={!isLoading}
              onFocus={() => {
                setShowKeypad(true);
                setIsFocused(true);
              }}
            />
          </View>
        </TouchableOpacity>
        {showValidationError && !error && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            Please enter a valid phone number, including your country code
          </Text>
        )}
        {error && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            {error}
          </Text>
        )}
      </View>

      <View className={`pb-16 ${showKeypad ? 'mb-72' : ''}`}>
        <Button
          text={isLoading ? "Checking..." : "Proceed"}
          onPress={handleProceed}
          isDisabled={!isValid || isLoading}
        />
      </View>

      {showKeypad && !isLoading && (
        <TouchableWithoutFeedback
          onPress={() => {
            setShowKeypad(false);
            setIsFocused(false);
          }}
        >
          <View className="absolute top-0 left-0 right-0" style={{ bottom: 400 }} />
        </TouchableWithoutFeedback>
      )}

      <NumericKeypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        isVisible={showKeypad && !isLoading}
      />
    </View>
  );
}