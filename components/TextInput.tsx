import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

type PhoneInputProps = {
  title?: string;
  placeholder?: string;
  initialValue?: string;
  minLength?: number;
  onValidChange?: (isValid: boolean) => void;
  onSubmit?: (phoneNumber: string) => void;
  autoFocus?: boolean;
};

export default function PhoneInput({
  title = "Enter Phone Number",
  placeholder = "+234-801-2345-678",
  initialValue = "",
  minLength = 10,
  onValidChange,
  autoFocus = true,
}: PhoneInputProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const [isValid, setIsValid] = useState(false);

  const handlePhoneChange = (text: string) => {
    // Format: Allow only numbers, +, and hyphens
    const formattedText = text.replace(/[^\d+-]/g, "");
    setPhoneNumber(formattedText);

    // Validation (count only digits)
    const digitsOnly = formattedText.replace(/\D/g, "");
    const valid = digitsOnly.length >= minLength;
    setIsValid(valid);
    onValidChange?.(valid);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white px-5 pt-12">
        {/* Title */}
        <Text className="text-2xl font-semibold text-black mb-6">{title}</Text>

        {/* Input Field */}
        <TextInput
          className="w-full bg-gray-100 text-black rounded-lg px-4 py-3 text-base border border-gray-800 mb-6"
          placeholder={placeholder}
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          autoFocus={autoFocus}
          style={{ height: 48 }} // Explicit height ensures visibility
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
