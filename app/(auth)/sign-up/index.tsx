import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { useClearBiometricSetup } from '@/store/useAuthStore';
import { usePhoneStore } from '@/store/usePhoneStore';
import { encryptPhoneData } from '@/utils/phoneEncyption';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { BackIcon, Lock_1 } from '../../../assets/images/svg';

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
    setFormattedNumber
  } = usePhoneStore();
  
  useEffect(() => {
    if (phoneNumber.length > 0) {
      let formatted = '+';
      formatted += phoneNumber.substring(0, 3);
      if (phoneNumber.length > 3) formatted += '-' + phoneNumber.substring(3, 6);
      if (phoneNumber.length > 6) formatted += '-' + phoneNumber.substring(6, 10);
      if (phoneNumber.length > 10) formatted += '-' + phoneNumber.substring(10, 13);
      setFormattedNumber(formatted);
    } else {
      setFormattedNumber('');
    }
  }, [phoneNumber, setFormattedNumber]);

  const handlePhoneChange = (text: string) => {
    const cleanedNumber = text.replace(/\D/g, '');
    setPhoneNumber(cleanedNumber);
    setIsValid(cleanedNumber.length === 13);
    setIsTouched(true);
    setError(null); // Clear error when user types
  };

  const handleKeyPress = (num: string) => {
    const newNumber = phoneNumber + num; 
    if (newNumber.length <= 13) {
      setPhoneNumber(newNumber); 
      setIsValid(newNumber.length === 13);
      setIsTouched(true);
      setError(null); // Clear error when user types
    }
  };

  useEffect(() => {
    if (phoneNumber.length === 13) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [phoneNumber]);

  const handleBackspace = () => {
    const newNumber = phoneNumber.slice(0, -1);
    setPhoneNumber(newNumber); 
    setIsValid(newNumber.length === 13);
    setIsTouched(true);
    setError(null); // Clear error when user types
  };
  
  const findUser = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Encrypt phone number for lookup using deterministic encryption
      const phoneHash = await encryptPhoneData(phoneNumber);
      console.log('Encrypted phone number:', phoneHash);
      
      console.log('Finding user with encrypted phone:', phoneHash.substring(0, 20) + '...');
      
      const response = await fetch('https://k33p-backend-i9kj.onrender.com/api/zk/find-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneHash: phoneHash
        }),
      });

      const data = await response.json();
      console.log('Find user response:', data);
      
      if (data.success && data.data) {
        // User exists - this is a sign-up screen, so user shouldn't exist
        console.log('❌ User already exists');
        return true; // User found
      } else {
        // User doesn't exist - good for sign-up
        console.log('✅ Phone number available for sign-up');
        return false; // User not found
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
    // Check if user already exists
    setIsLoading(true);

    const userExists = await findUser();
    
    if (userExists) {
      // User already exists
      setError('Phone number already exists. Try another.');
      return;
    }
    
    // User doesn't exist, proceed to OTP
    setShowKeypad(false);
    setIsFocused(false);
    setTimeout(() => {
      router.push('/sign-up/otp');
    }, 100);
  };

  const showValidationError = isTouched && !isValid && phoneNumber.length > 0;
  const clearBiometricSetup = useClearBiometricSetup();

  useEffect(() => {
    clearBiometricSetup();
  }, [clearBiometricSetup]);

  return (
    <View className="flex-1 px-5">
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
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

      {/* Content */}
      <View className="flex-1">
        <Text className="text-white font-sora text-sm mb-4">
          Enter Phone Number
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
                showValidationError || error ? 'text-error500' : 'text-white'
              } font-sora text-sm mb-1 border ${
                isFocused ? 'border-white' : 'border-neutral200'
              }`}
              placeholder="+234-801-2345-678"
              placeholderTextColor="#969696"
              keyboardType="phone-pad"
              value={formattedNumber}
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

        {/* Validation Error */}
        {showValidationError && !error && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            Phone number must be 13 digits (including country code)
          </Text>
        )}

        {/* User Exists Error */}
        {error && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            {error}
          </Text>
        )}
      </View>

      {/* Footer */}
      <View className={`pb-16 ${showKeypad ? 'mb-72' : ''}`}>
        <Button
          text={isLoading ? "Checking..." : "Proceed"}
          onPress={handleProceed}
          isDisabled={!isValid || isLoading}
        />
        
        
      </View>

      {/* Dismiss Keypad Overlay */}
      {showKeypad && (
        <TouchableWithoutFeedback
          onPress={() => {
            setShowKeypad(false);
            setIsFocused(false);
          }}
        >
          <View 
            className="absolute top-0 left-0 right-0"
            style={{ bottom: 400 }}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Custom Numeric Keypad */}
      <NumericKeypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        isVisible={showKeypad}
      />
    </View>
  );
}