import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import BackspaceIcon from './../assets/images/backspace.png';

interface NumericKeypadProps {
  onKeyPress?: (value: string) => void;
  onBackspace?: () => void;
  isVisible?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress = () => {},
  onBackspace = () => {},
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <View className="w-full bg-gray-100 border-t border-gray-300 absolute bottom-0">
      {/* Keypad Rows */}
      <View className="flex-row justify-between px-4 py-3">
        {['1', '2', '3'].map((num) => (
          <KeyButton key={num} value={num} onPress={onKeyPress} />
        ))}
      </View>
      
      <View className="flex-row justify-between px-4 py-3">
        {['4', '5', '6'].map((num) => (
          <KeyButton key={num} value={num} onPress={onKeyPress} />
        ))}
      </View>
      
      <View className="flex-row justify-between px-4 py-3">
        {['7', '8', '9'].map((num) => (
          <KeyButton key={num} value={num} onPress={onKeyPress} />
        ))}
      </View>
      
      {/* Bottom Row */}
      <View className="flex-row justify-between px-4 py-3">
        <View className="w-1/3" /> {/* Spacer */}
        <KeyButton value="0" onPress={onKeyPress} />
        <TouchableOpacity
          className="w-1/3 items-center justify-center"
          onPress={onBackspace}
        >
          <Image source={BackspaceIcon} className="w-8 h-8" resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const KeyButton = ({ value, onPress }: { value: string; onPress: (value: string) => void }) => (
  <TouchableOpacity
    className="w-1/3 items-center justify-center py-3"
    onPress={() => onPress(value)}
  >
    <Text className="text-3xl text-gray-800">{value}</Text>
  </TouchableOpacity>
);

// Example usage with input field
export const InputWithKeypad = () => {
  const [value, setValue] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);

  const handleKeyPress = (num: string) => {
    setValue(prev => prev + num);
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1));
  };

  return (
    <View className="flex-1">
      {/* Your input field - just trigger the keypad visibility */}
      <TouchableOpacity 
        className="p-4 border-b border-gray-300"
        onPress={() => setShowKeypad(true)}
      >
        <Text className="text-lg">
          {value || 'Tap to enter number'}
        </Text>
      </TouchableOpacity>

      {/* The always-visible keypad */}
      <NumericKeypad
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        isVisible={showKeypad}
      />
    </View>
  );
};