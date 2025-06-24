import Button from '@/components/Button';
import NumericKeypad from '@/components/Keypad';
import { usePhoneStore } from '@/store/usePhoneStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BackButton from '../../../assets/images/back.png';
import LockIcon from '../../../assets/images/lock-1.png';

export default function PhoneEntryScreen() {
  const router = useRouter();
  const [rawPhoneNumber, setRawPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
    setPhoneNumber(cleanedNumber); // Use the store setter
    setIsValid(cleanedNumber.length === 13);
    setIsTouched(true);
  };

  const handleKeyPress = (num: string) => {
    const newNumber = phoneNumber + num; 
    if (newNumber.length <= 13) {
      setPhoneNumber(newNumber); 
      setIsValid(newNumber.length === 13);
      setIsTouched(true);
    }
  };

  useEffect(() => {
    if (phoneNumber.length == 13) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [phoneNumber]);

  const handleBackspace = () => {
    const newNumber = phoneNumber.slice(0, -1); // Use the store value
    setPhoneNumber(newNumber); 
    setIsValid(newNumber.length === 13);
    setIsTouched(true);
  };

  const handleProceed = () => {
    console.log('Entered phone number:', formattedNumber);
    router.push('/sign-up/otp');
  };

  const showError = isTouched && !isValid && phoneNumber.length > 0;

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
        <Text className="text-white font-sora text-sm  mb-4">
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
              className={` rounded-lg  px-5 py-3 mb-2 ${
                showError ? 'text-error500' : 'text-white'
              } font-sora text-sm mb-1 border ${
                isFocused ? 'border-white' : 'border-neutral200'
              }`}
              placeholder="+234-801-2345-678"
              placeholderTextColor="#969696"
              keyboardType="phone-pad"
              value={formattedNumber}
              onChangeText={handlePhoneChange}
              maxLength={18} // +xxx-xxx-xxxx-xxx is 18 characters
              showSoftInputOnFocus={false}
              onFocus={() => {
                setShowKeypad(true);
                setIsFocused(true);
              }}
            />
          </View>
        </TouchableOpacity>

        {showError && (
          <Text className="text-error500 font-sora text-center text-sm p-2">
            Phone number must be 13 digits (including country code)
          </Text>
        )}
      </View>

      {/* Footer */}
      <View className={`pb-8 ${showKeypad ? 'mb-80' : ''}`}>
        <Button
          text="Proceed"
          onPress={handleProceed}
          isDisabled={!isValid }
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