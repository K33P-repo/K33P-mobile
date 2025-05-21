import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type WalletOptionProps = {
  name: string;
  selected?: boolean;
  onSelect?: () => void;
  showRadio?: boolean;
};

const WalletOption = ({
  name,
  selected = false,
  onSelect,
  showRadio = true,
}: WalletOptionProps) => (
  <TouchableOpacity
    className="flex-row items-center p-2 mb-4 "
    onPress={onSelect}
  >
    {showRadio && (
      <View className="mr-3">
        <MaterialIcons
          name={selected ? "radio-button-checked" : "radio-button-unchecked"}
          size={24}
          color={selected ? "#FFD939" : "#9CA3AF"}
        />
      </View>
    )}
    <Text className="w-[130px] h-[20px] font-sora-medium text-[16px] leading-[16px]  text-white">
      {name}
    </Text>
  </TouchableOpacity>
);

export default WalletOption;
