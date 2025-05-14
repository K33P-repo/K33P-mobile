import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import BackspaceIcon from "./../assets/images/backspace.png";

interface NumericKeypadProps {
  onKeyPress: (value: string) => void;
  onBackspace: () => void;
  isVisible: boolean;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onBackspace,
  isVisible,
}) => {
  if (!isVisible) return null;

  const KeyButton = ({ value }: { value: string }) => (
    <TouchableOpacity
      className="w-1/3 items-center justify-center h-12"
      onPress={() => onKeyPress(value)}
    >
      <Text className="text-2xl text-white">{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="w-full bg-gray-800 absolute bottom-0 ">
      {/* Row 1 */}
      <View className="flex-row justify-between mb-8 ">
        {["1", "2", "3"].map((num) => (
          <KeyButton key={num} value={num} />
        ))}
      </View>

      {/* Row 2 */}
      <View className="flex-row justify-between mb-8 ">
        {["4", "5", "6"].map((num) => (
          <KeyButton key={num} value={num} />
        ))}
      </View>

      {/* Row 3 */}
      <View className="flex-row justify-between mb-8 ">
        {["7", "8", "9"].map((num) => (
          <KeyButton key={num} value={num} />
        ))}
      </View>

      {/* Bottom Row */}
      <View className="flex-row justify-between mb-8 ">
        <View className="w-1/3" /> {/* Spacer */}
        <KeyButton value="0" />
        <TouchableOpacity
          className="w-1/3 items-center justify-center h-5"
          onPress={onBackspace}
        >
          <Image 
            source={BackspaceIcon} 
            className="w-2 h-2" 
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NumericKeypad;