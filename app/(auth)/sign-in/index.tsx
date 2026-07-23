import { BackIcon, SIGN_IN_0 } from '@/assets/images/svg';
import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { AuthMethod, useAuthStore } from '@/store/useAuthMethod';
import { usePhoneStore } from '@/store/usePhoneStore';
import { usePhoneVerificationStore } from '@/store/usePhoneVerificationStore';
import { sendOTP } from '@/utils/api';
import { encryptPhoneData } from '@/utils/phoneEncyption';
import { useRouter } from 'expo-router';
import { AsYouType, isValidPhoneNumber } from 'libphonenumber-js';
import React, { useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const MAX_PHONE_DIGITS = 15; // max length of any E.164 number (excluding the leading +)

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
  const {
    phoneNumber,
    formattedNumber,
    setPhoneNumber,
    setFormattedNumber,
  } = usePhoneStore();

  const {
    setUserAuthMethods,
    setUserId,
    setWalletAddress,
    setUsername,
    setToken
  } = useAuthStore();

  const { isPhoneVerified } = usePhoneVerificationStore();

  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

      // Yield to UI thread before heavy crypto work
      await new Promise(resolve => setTimeout(resolve, 0));

      const phoneHash = await encryptPhoneData(phoneNumber);
      console.log('Encrypted phone number:', phoneHash.substring(0, 20) + '...');

      // Yield again before network request
      await new Promise(resolve => setTimeout(resolve, 0));

      const response = await fetch('https://k33p-backend-i9kj.onrender.com/api/zk/find-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneHash }),
      });

      const rawText = await response.text();
      console.log('Status:', response.status);
      console.log('Raw response:', rawText.substring(0, 300)); // see what's actually coming back

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        setError(`Server error (${response.status}). Please try again.`);
        return false;
      }

      if (data.success && data.data) {
        const userData = data.data;

        if (userData.authMethods && Array.isArray(userData.authMethods)) {
          setUserAuthMethods(userData.authMethods);
          console.log('✅ Stored auth methods:', userData.authMethods.map((m: AuthMethod) => m.type));
        }
        if (userData.userId) setUserId(userData.userId);
        if (userData.walletAddress) setWalletAddress(userData.walletAddress);
        if (userData.username) {
          setUsername(userData.username);
          console.log('✅ Stored username:', userData.username);
        }

        console.log('✅ User found:', {
          userId: userData.userId,
          authMethodsCount: userData.authMethods?.length,
          walletAddress: userData.walletAddress,
        });

        return true;
      } else {
        setError(data.error?.message || 'User not found');
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

  const handleProceed = () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setShowKeypad(false);

    setTimeout(async () => {
      const userFound = await findUser();
      if (!userFound) return;

      if (isPhoneVerified(phoneNumber)) {
        console.log('✅ Phone already verified, skipping OTP');
        router.push('/sign-in/pinsetup');
        return;
      }

      try {
        await sendOTP(phoneNumber);
        router.push('/sign-in/otp');
      } catch (err: any) {
        setError(err.message || 'Failed to send OTP. Please try again.');
        setIsLoading(false);
      }
    }, 100);
  };

  const showError = isTouched && !isValid && phoneNumber.length > 0;

  return (
    <View className="flex-1 px-5">
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()} disabled={isLoading}>
          <BackIcon width={40} height={40} />
        </TouchableOpacity>
        <SIGN_IN_0
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
              className={`rounded-lg px-5 py-3 mb-2 font-sora text-sm border ${error || showError
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

        {showError && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            Please enter a valid phone number, including your country code
          </Text>
        )}

        {error && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            User not found
          </Text>
        )}
      </View>

      <View className={`pb-5 ${showKeypad ? 'mb-80' : 'mb-14'}`}>
        <Button
          text={isLoading ? "Finding User..." : "Proceed"}
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
          <View className="absolute top-0 left-0 right-0 bg-transparent" style={{ bottom: 400 }} />
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