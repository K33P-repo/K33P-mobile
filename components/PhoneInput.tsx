import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
  const [showError, setShowError] = useState(false);

  const handlePhoneChange = (text: string) => {
    const formattedText = text.replace(/[^\d+-]/g, "");
    setPhoneNumber(formattedText);
    const digitsOnly = formattedText.replace(/\D/g, "");
    const valid = digitsOnly.length >= minLength;
    setIsValid(valid);
    onValidChange?.(valid);
    setShowError(false); // Hide error when typing
  };

  const validatePhoneNumber = () => {
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    const valid = digitsOnly.length >= minLength;
    setShowError(!valid);
    return valid;
  };

  const handleBlur = () => {
    validatePhoneNumber();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white px-5 pt-12">
        {/* Title */}
        <Text className="w-[335px] h-[21px] font-sora font-medium text-[14px] leading-[21px] text-mainBlack">
          {title}
        </Text>

        {/* Input Field */}
        <TextInput
          className="w-[335px] h-[45px] bg-white rounded-lg border border-gray-300 
                    pt-3 pr-4 pb-3 pl-4 mb-1 text-base text-black"
          placeholder={placeholder}
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          textAlignVertical="center"
        />

        {/* Error Message - Only shown when invalid and blurred or submitted */}
        {showError && (
          <Text className="w-[335px] text-red-500 text-[12px] leading-[18px] mb-2">
            Invalid Phone number. Enter a valid phone number
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}