import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BackButton from '../../../../assets/images/back.png';
import LockIcon from '../../../../assets/images/loginlock-2.png';

export default function PinEntryScreen() {
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  // Mock PIN for development
  const MOCK_PIN = '0000';

  const handleKeyPress = (num: string) => {
    if (currentIndex < 4) {
      const newPin = [...pin];
      newPin[currentIndex] = num;
      setPin(newPin);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBackspace = () => {
    if (currentIndex > 0) {
      const newPin = [...pin];
      newPin[currentIndex - 1] = '';
      setPin(newPin);
      setCurrentIndex(currentIndex - 1);
    }
    setIsError(false);
  };

  const handleSubmit = () => {
    const enteredPin = pin.join('');
    
    if (enteredPin === MOCK_PIN) {
      router.push('/sign-up/biometrics/fingerprint');
    } else {
      setIsError(true);
      setPin(['', '', '', '']);
      setCurrentIndex(0);
    }
  };

  const focusPinCircle = (index: number) => {
    setCurrentIndex(index);
    setShowKeypad(true);
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowKeypad(false)}>
      <View className="flex-1 bg-neutral800 px-5 pt-12">
        {/* Header */}
        <View className="relative flex-row items-center justify-start mb-12">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
          </TouchableOpacity>
          <Image
            source={LockIcon}
            className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-[88px]"
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-white font-sora-bold text-sm text-center mb-1">
            Enter your PIN
          </Text>
          <Text className="text-sm font-sora text-center mb-6 px-8 py-2 text-neutral200">
            {isError ? 'Incorrect PIN, try again' : 'Enter your 4-digit PIN'}
          </Text>

          {/* PIN Circles */}
          <View className="flex-row justify-center mb-2">
            {pin.map((digit, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                onPress={() => focusPinCircle(index)}
                className={`w-6 h-6 mx-3 rounded-full border items-center justify-center ${
                  isError
                    ? 'border-error500'
                    : digit !== ''
                    ? 'bg-neutral200 border-neutral200'
                    : 'border-neutral200'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <View className={`pb-8 ${showKeypad ? 'mb-80' : ''}`}>
          <Button
            text="Continue"
            onPress={handleSubmit}
            isDisabled={pin.some(d => d === '')}
          />
        </View>

        {/* Keypad Toggle Area */}
        {showKeypad && (
          <TouchableWithoutFeedback onPress={() => setShowKeypad(false)}>
            <View className="absolute top-0 left-0 right-0 bottom-80 bg-transparent" />
          </TouchableWithoutFeedback>
        )}

        {/* Numeric Keypad */}
        <NumericKeypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          isVisible={showKeypad}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}