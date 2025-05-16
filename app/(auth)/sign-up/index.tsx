import NumericKeypad from '@/components/Keypad';
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';

export default function Index() {  
  const [inputValue, setInputValue] = useState("");
  const [amount, setAmount] = useState('');

  const handleKeyPress = (num: string) => {
    setInputValue(prev => prev + num);
  };

  const handleBackspace = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  const [showKeypad, setShowKeypad] = useState(false);

  return (
    <View className="flex-1">
      {/* Your existing input field */}
      <TextInput
        value={amount}
        className="p-4 text-xl border-b border-gray-300"
        placeholder="Enter amount"
        showSoftInputOnFocus={false}
        onFocus={() => setShowKeypad(true)}
        onBlur={() => setShowKeypad(false)}
      />

      {/* Other content */}

      {/* The keypad - always at bottom but visibility controlled */}
      <NumericKeypad
        onKeyPress={(num) => setAmount(prev => prev + num)}
        onBackspace={() => setAmount(prev => prev.slice(0, -1))}
        isVisible={showKeypad}
      />
    </View>
  )
}