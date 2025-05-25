import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BackButton from '../../../../assets/images/back.png';
import LockIcon2 from '../../../../assets/images/loginlock-2.png';
import LockIcon3 from '../../../../assets/images/loginlock-3.png';

export default function PinSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = setup, 2 = confirm
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  const handleKeyPress = (num: string) => {
    if (currentIndex < 4) {
      if (step === 1) {
        const newPin = [...pin];
        newPin[currentIndex] = num;
        setPin(newPin);
        setCurrentIndex(currentIndex + 1);
      } else {
        const newConfirm = [...confirmPin];
        newConfirm[currentIndex] = num;
        setConfirmPin(newConfirm);
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleBackspace = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    if (step === 1) {
      const newPin = [...pin];
      newPin[currentIndex] = '';
      setPin(newPin);
    } else {
      const newConfirm = [...confirmPin];
      newConfirm[currentIndex] = '';
      setConfirmPin(newConfirm);
    }
  };

  useEffect(() => {
    if (step === 2) {
      const confirmComplete = confirmPin.every((d) => d !== '');
      if (confirmComplete) {
        const match = pin.join('') === confirmPin.join('');
        setIsValid(match);
        setIsError(!match);

        if (!match) {
          setTimeout(() => {
            setPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            setCurrentIndex(0);
            setIsError(false);
            setStep(1);
          }, 1500);
        }
      }
    }
  }, [confirmPin]);

  const handleProceed = () => {
    if (step === 1) {
      const pinComplete = pin.every((d) => d !== '');
      if (pinComplete) {
        setStep(2);
        setConfirmPin(['', '', '', '']);
        setCurrentIndex(0);
      }
    } else if (step === 2 && isValid) {
      router.push('/sign-up/biometrics');
    }
  };

  const focusPinCircle = (index: number) => {
    setCurrentIndex(index);
    setShowKeypad(true);
  };

  const getSubtext = () => {
    if (step === 1) return 'Setup your 4-digit PIN';
    if (step === 2 && isValid) return 'PIN match successfully';
    return 'Confirm your 4-digit PIN';
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowKeypad(false)}>
      <View className="flex-1 bg-neutral800 px-5 pt-12">
        {/* Header */}
        <View className="relative flex-row items-center justify-start mb-12">
          <TouchableOpacity className="z-10" onPress={() => router.back()}>
            <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
          </TouchableOpacity>
          <Image
            source={isValid ? LockIcon3 : LockIcon2}
            className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-[88px]"
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-white font-sora-bold text-sm text-center mb-1">
            {step === 1 ? 'Setup PIN' : 'Confirm PIN'}
          </Text>
          <Text className="text-sm font-sora text-center mb-6 px-8 py-2 text-neutral200">
            {getSubtext()}
          </Text>

          {/* PIN Circles */}
          <View className="flex-row justify-center mb-2">
            {(step === 1 ? pin : confirmPin).map((digit, index) => {
              const filled = digit !== '';
              const matched = isValid && step === 2;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={1}
                  onPress={() => focusPinCircle(index)}
                  className={`w-6 h-6 mx-3 rounded-full border items-center justify-center ${
                    isError && step === 2
                      ? 'border-error500'
                      : matched
                      ? 'bg-success500 border-success500'
                      : filled
                      ? 'bg-neutral200 border-neutral200'
                      : 'border-neutral200'
                  }`}
                />
              );
            })}
          </View>

          {/* Error Message */}
          {isError && step === 2 && (
            <Text className="text-error500 text-center text-sm  mt-3">
              The PIN you entered is incorrect. Please  try again
            </Text>
          )}
        </View>

        {/* Confirm / Continue Button */}
        <View className={`pb-8 ${showKeypad ? 'mb-80' : ''}`}>
          <Button
            text={step === 1 ? 'Confirm' : isValid ? 'Continue' : 'Confirm'}
            onPress={handleProceed}
            isDisabled={
              (step === 1 && pin.some((d) => d === '')) ||
              (step === 2 && !isValid)
            }
          />
        </View>

        {/* Dismiss Keypad Area */}
        {showKeypad && (
          <TouchableWithoutFeedback onPress={() => setShowKeypad(false)}>
            <View className="absolute top-0 left-0 right-0 bottom-80 bg-transparent" />
          </TouchableWithoutFeedback>
        )}

        {/* Custom Keypad */}
        <NumericKeypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          isVisible={showKeypad}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
