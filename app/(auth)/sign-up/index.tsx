import Button from "@/components/Button";
import PhoneInput from "@/components/PhoneInput";
import TabLayout from "@/components/TabLayout";
import NumericKeypad from '@/components/Keypad';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, LayoutChangeEvent } from "react-native";

export default function PhoneInputScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isKeypadVisible, setIsKeypadVisible] = useState(true);
  const [keypadHeight, setKeypadHeight] = useState(0); // State to store keypad height

  const handleKeyPress = (key: string) => {
    setPhoneNumber(prev => {
      const newNumber = prev + key;
      const digitsOnly = newNumber.replace(/\D/g, "");
      setIsValid(digitsOnly.length === 11);
      return newNumber;
    });
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => {
      const newNumber = prev.slice(0, -1);
      const digitsOnly = newNumber.replace(/\D/g, "");
      setIsValid(digitsOnly.length === 11);
      return newNumber;
    });
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    const digitsOnly = text.replace(/\D/g, "");
    setIsValid(digitsOnly.length === 11);
  };

  // Callback to measure the keypad height
  const handleKeypadLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setKeypadHeight(height);
  };

  return (
    <View className="flex-1">
      <View className="flex-1 p-5 mx-5 relative">
        <TabLayout />
        <PhoneInput
          title="Enter Phone Number"
          placeholder="+234-801-2345-678"
          initialValue={phoneNumber}
          minLength={11}
          onValidChange={setIsValid}
          autoFocus={true}
          onChangeText={handlePhoneChange}
          onFocus={() => setIsKeypadVisible(true)}
          onBlur={() => setIsKeypadVisible(false)}
          showSoftInputOnFocus={false}
        />
        
        {/* Position the button dynamically based on keypad height */}
        <View
          className="absolute left-0 right-0 px-5"
          style={{
            bottom: isKeypadVisible ? keypadHeight + 16 : 32, // 16px padding above keypad
          }}
        >
          <Button
            text="Proceed"
            isDisabled={!isValid}
            onPress={() => router.push('/sign-up/otp')}
            outline={false}
            isLoading={false}
          />
        </View>

        {/* Add onLayout to measure keypad height */}
        <View onLayout={handleKeypadLayout}>
          <NumericKeypad
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
            isVisible={isKeypadVisible}
          />
        </View>
      </View>
    </View>
  );
}