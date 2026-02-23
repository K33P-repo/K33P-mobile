import { BackIcon, SIGN_IN_1, SIGN_IN_2 } from '@/assets/images/svg';
import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { useAuthStore } from '@/store/useAuthMethod';
import { usePhoneStore } from '@/store/usePhoneStore';
import { encryptPhoneData } from '@/utils/phoneEncyption';
import { hashPin } from '@/utils/pinEncryption';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function PinEntryScreen() {
  const router = useRouter();
  const { userId, walletAddress, userAuthMethods, setToken } = useAuthStore();
  const { phoneNumber } = usePhoneStore();
  
  const [pin, setPin] = useState(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const [showKeypad, setShowKeypad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const processingRef = useRef(false); // prevent double submissions

  const handleKeyPress = (num: string) => {
    if (currentIndex < 4 && !isLoading) {
      const newPin = [...pin];
      newPin[currentIndex] = num;
      setPin(newPin);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBackspace = () => {
    if (isLoading) return;
    if (currentIndex > 0) {
      const newPin = [...pin];
      newPin[currentIndex - 1] = '';
      setPin(newPin);
      setCurrentIndex(currentIndex - 1);
    }
    setIsError(false);
  };

  useEffect(() => {
    const enteredPinComplete = pin.every(d => d !== '');
    if (enteredPinComplete && !processingRef.current) {
      processingRef.current = true;
      setIsLoading(true); // show loading immediately
      setShowKeypad(false); // hide keypad immediately
      // Use 100ms delay so React fully paints loading state before sync crypto runs
      setTimeout(() => {
        handleSubmit(pin.join(''));
      }, 100);
    }
  }, [pin]);

  const resetPin = () => {
    setPin(['', '', '', '']);
    setCurrentIndex(0);
    setIsLoading(false);
    processingRef.current = false;
  };

  const handleLoginWithPin = async (enteredPin: string): Promise<boolean> => {
    try {
      if (!phoneNumber || !userId || !userAuthMethods) {
        Alert.alert('Error', 'Missing authentication data. Please restart the login process.');
        return false;
      }

      // hashPin is synchronous heavy work — runs here after loading state is painted
      const pinHash = hashPin(enteredPin, userId);
      console.log('✅ PIN hashed');

      const phoneHash = await encryptPhoneData(phoneNumber);
      console.log('✅ Phone encrypted');

      const response = await fetch('https://k33p-backend-i9kj.onrender.com/api/zk/login-with-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneHash,
          authMethod: 'pin',
          pinHash,
          authMethods: userAuthMethods
        }),
      });

      const result = await response.json();
      console.log('📥 Server response:', result.success);

      if (result.success && result.data?.token) {
        setToken(result.data.token);
        return true;
      } else {
        if (result.error?.message?.includes('PIN')) {
          Alert.alert('Invalid PIN', 'The PIN you entered is incorrect. Please try again.');
        } else if (result.error?.message?.includes('Authentication methods')) {
          Alert.alert('Authentication Error', 'Your authentication data does not match. Please restart the login process.');
        } else {
          Alert.alert('Login Failed', result.error?.message || 'Unable to login. Please try again.');
        }
        return false;
      }
    } catch (error) {
      console.error('💥 NETWORK ERROR:', error);
      Alert.alert('Connection Error', 'Failed to connect to server. Please check your internet connection and try again.');
      return false;
    }
  };

  // Takes pin string directly to avoid stale closure issues
  const handleSubmit = async (enteredPin: string) => {
    try {
      if (enteredPin.length !== 4) {
        setIsError(true);
        setTimeout(() => {
          resetPin();
          setIsError(false);
        }, 1000);
        return;
      }

      const loginSuccess = await handleLoginWithPin(enteredPin);

      if (loginSuccess) {
        setIsUnlocked(true);
        setTimeout(() => {
          router.push('/(auth)/sign-in/fingerprint');
        }, 500);
      } else {
        setIsError(true);
        setTimeout(() => {
          resetPin();
          setIsError(false);
          setShowKeypad(true);
        }, 1000);
      }
    } finally {
      if (!isUnlocked) {
        processingRef.current = false;
      }
    }
  };

  const focusPinCircle = (index: number) => {
    if (isLoading) return;
    setCurrentIndex(index);
    setShowKeypad(true);
  };

  if (!phoneNumber || !userId || !userAuthMethods) {
    return (
      <View className="flex-1 px-5 justify-center items-center">
        <Text className="text-white text-center mb-4 font-sora">
          Missing authentication data. Please go back and try again.
        </Text>
        <Button text="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => !isLoading && setShowKeypad(false)}>
      <View className="flex-1 px-5">
        <View className="relative flex-row items-center justify-start mb-12">
          <TouchableOpacity className="z-10" onPress={() => router.back()} disabled={isLoading}>
            <BackIcon width={40} height={40} />
          </TouchableOpacity>
          {isUnlocked ? (
            <SIGN_IN_2 style={{ position: 'absolute', left: '50%', transform: [{ translateX: '-50%' }] }} />
          ) : (
            <SIGN_IN_1 style={{ position: 'absolute', left: '50%', transform: [{ translateX: '-50%' }] }} />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-white font-sora-bold text-sm text-center mb-1">
            Enter your PIN
          </Text>
          <Text className="text-sm font-sora text-center mb-6 px-8 py-2 text-neutral200">
            {isError ? 'Incorrect PIN, try again' : isLoading ? 'Verifying...' : 'Enter your 4-digit PIN'}
          </Text>

          <View className="flex-row justify-center mb-2">
            {pin.map((digit, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                onPress={() => focusPinCircle(index)}
                disabled={isLoading}
                className={`w-6 h-6 mx-3 rounded-full border items-center justify-center ${
                  isUnlocked
                    ? 'bg-success500 border-green-500'
                    : isError
                    ? 'border-error500'
                    : digit !== ''
                    ? 'bg-neutral200 border-neutral200'
                    : 'border-neutral200'
                }`}
              />
            ))}
          </View>
        </View>

        <View className={`pb-16 ${showKeypad ? 'mb-72' : ''}`}>
          <Button
            text={isLoading ? "Verifying..." : "Continue"}
            onPress={() => {
              if (!isLoading && pin.every(d => d !== '')) {
                processingRef.current = true;
                setIsLoading(true);
                setShowKeypad(false);
                setTimeout(() => handleSubmit(pin.join('')), 100);
              }
            }}
            isDisabled={pin.some(d => d === '') || isLoading}
          />
        </View>

        {showKeypad && !isLoading && (
          <TouchableWithoutFeedback onPress={() => setShowKeypad(false)}>
            <View className="absolute top-0 left-0 right-0 bg-transparent" style={{ bottom: 400 }} />
          </TouchableWithoutFeedback>
        )}

        <NumericKeypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          isVisible={showKeypad && !isLoading}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}