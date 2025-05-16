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
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showSoftInputOnFocus: boolean;
};

export default function PhoneInput({
  title = "Enter Phone Number",
  placeholder = "+234-801-2345-678",
  initialValue = "",
  minLength = 10,
  onValidChange,
  autoFocus = true,
  onChangeText,
  onFocus,
  onBlur,
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
      <View className=" flex-1 bg-[#1A1A1A] pt-14">
        {/* Title */}
        <Text className="w-[335px] h-[21px] font-sora font-medium text-[14px] leading-[21px] tracking-[0] text-white">
          {title}
        </Text>

        {/* Input Field */}
        <TextInput
          className="w-full bg-mainBlack text-white rounded-lg py-3 border border-neutral200 mb-6 font-sora text-[14px] leading-[21px] tracking-[0]"
          placeholder={placeholder}
          placeholderTextColor="neutral300"
          value={phoneNumber}
          onChangeText={(text) => {
            handlePhoneChange(text);
            onChangeText?.(text);
          }}
          autoFocus={autoFocus}
          style={{ height: 48 }}
          onFocus={onFocus}
          onBlur={onBlur}
          showSoftInputOnFocus={false}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
