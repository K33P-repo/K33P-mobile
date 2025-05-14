import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';

export default function SetupPinScreen() {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handlePinChange = (text: string, index: number) => {
    // Only allow digits and take first character
    const digit = text.replace(/[^0-9]/g, '')[0] || '';
    
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }, index: number) => {
    // Handle backspace
    if (nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={1}
      onPress={Keyboard.dismiss}
      className="flex-1 items-center px-6 pt-12 bg-white"
    >
      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Setup PIN
      </Text>
      
      {/* Subtitle */}
      <Text className="text-gray-600 mb-10 text-center">
        Setup your 4-digit PIN
      </Text>
      
      {/* PIN Input Boxes */}
      <View className="flex-row justify-between w-full max-w-xs mb-8" style={{ gap: 16 }}>
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            className= "w-6 h-6 rounded-full border border-gray-300 text-center text-2xl font-bold focus:border-blue-500"
            value={digit}
            onChangeText={(text) => handlePinChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            secureTextEntry={true}
            autoFocus={index === 0}
            style={{
              textAlignVertical: 'center'
            }}
          />
        ))}
      </View>
    </TouchableOpacity>
  );
}