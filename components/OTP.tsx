import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";



export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "")[0] || "";
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    { nativeEvent }: { nativeEvent: { key: string } },
    index: number
  ) => {
    if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={Keyboard.dismiss}
      className="flex-1 items-center px-6 pt-12 bg-black"
    >
      {/* Title */}
      <Text className="w-[290px] h-[18px] text-center font-sora font-bold text-[14px] leading-[14px] tracking-[0] text-[#ffffff] mb-1">
        Enter OTP
      </Text>

      {/* Subtitle */}
      <Text className="w-[290px] h-[42px] text-center font-sora font-medium text-[14px] leading-[21px] tracking-[0] text-gray-600">
        A 5-digit OTP has been sent to
      </Text>

      {/* Phone number - Updated to exact specs */}
      <Text className="w-[290px] h-[24px] text-center font-sora font-medium text-[16px] leading-[24px] tracking-[0] text-gray-600 mb-10">
        +234****78
      </Text>

      {/* OTP Input Boxes */}
      <View className="w-[306px] flex-row justify-between mb-8" style={{ gap: 24 }}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            className="w-[42px] h-[42px] border border-gray-300 rounded-[8px] text-center text-2xl font-bold focus:border-blue-500"
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            textContentType="oneTimeCode"
            autoFocus={index === 0}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
}
