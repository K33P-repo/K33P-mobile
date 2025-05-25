import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BackButton from '../../../assets/images/back.png';
import LockIcon from '../../../assets/images/lock-4.png';

export default function PhoneEntryScreen() {
  const router = useRouter();
  const [rawPhoneNumber, setRawPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Format phone number as +xxx-xxx-xxxx-xxx
  useEffect(() => {
    if (rawPhoneNumber.length > 0) {
      let formatted = '+';
      if (rawPhoneNumber.length > 0) {
        formatted += rawPhoneNumber.substring(0, 3);
      }
      if (rawPhoneNumber.length > 3) {
        formatted += '-' + rawPhoneNumber.substring(3, 6);
      }
      if (rawPhoneNumber.length > 6) {
        formatted += '-' + rawPhoneNumber.substring(6, 10);
      }
      if (rawPhoneNumber.length > 10) {
        formatted += '-' + rawPhoneNumber.substring(10, 13);
      }
      setFormattedPhoneNumber(formatted);
    } else {
      setFormattedPhoneNumber('');
    }
  }, [rawPhoneNumber]);

  const handlePhoneChange = (text: string) => {
    const cleanedNumber = text.replace(/\D/g, '');
    setRawPhoneNumber(cleanedNumber);
    setIsValid(cleanedNumber.length === 13);
    setIsTouched(true);
  };

  const handleKeyPress = (num: string) => {
    const newNumber = rawPhoneNumber + num;
    if (newNumber.length <= 13) {
      setRawPhoneNumber(newNumber);
      setIsValid(newNumber.length === 13);
      setIsTouched(true);
    }
  };

  const handleBackspace = () => {
    const newNumber = rawPhoneNumber.slice(0, -1);
    setRawPhoneNumber(newNumber);
    setIsValid(newNumber.length === 13);
    setIsTouched(true);
  };

  const handleProceed = () => {
    console.log('Entered phone number:', formattedPhoneNumber);
    router.push('/sign-in/otp');
  };

  const handleNOK = () => {
    console.log('Login as NOK');
    setShowKeypad(true)
  };

  const showError = isTouched && !isValid && rawPhoneNumber.length > 0;
  
  // Determine if NOK button should be shown
  const showNOKButton = !showKeypad && rawPhoneNumber.length === 0;

  return (
    <View className="flex-1 bg-neutral800 px-5 pt-12">
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
          <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
        </TouchableOpacity>
        <Image
          source={LockIcon}
          className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-"
          resizeMode="contain"
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
                showError ? 'text-error500 border-error500' : 'text-white border-neutral200'
              } font-sora text-sm border ${
                isFocused ? 'border-white' : 'border-neutral200'
              }`}
              placeholder="+234-801-2345-678"
              placeholderTextColor="#969696"
              keyboardType="phone-pad"
              value={formattedPhoneNumber}
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

        {showError && (
          <Text className="text-error500 font-sora text-sm p-2">
            Phone number must be 13 digits (including country code)
          </Text>
        )}
      </View>

      {/* Footer */}
      <View className={`pb-5 ${showKeypad ? 'mb-80' : ''}`}>
        <Button
          text="Proceed"
          onPress={handleProceed}
          isDisabled={!isValid}
        />
        
        {showNOKButton && (
          <View className='mt-5'>
            <Button
              text="Login as NOK"
              onPress={handleNOK}
              outline
            />
          </View>
        )}
      </View>

      {/* Dismiss Keypad Overlay */}
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

      {/* Custom Numeric Keypad */}
      <NumericKeypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        isVisible={showKeypad}
      />
    </View>
  );
}