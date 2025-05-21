import React, { useState } from "react";
import { View, TextInput, TouchableOpacity,} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

type SearchInputProps = {
  onSubmit?: (query: string) => void;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function SearchInput({
  onSubmit,
  onChangeText,
  onFocus,
  onBlur,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="flex-1 bg-[#1A1A1A] p-4">
      {/* Search Input Field */}
      <View className="relative mb-6">
        <TextInput
          className="w-full bg-mainBlack text-white rounded-lg py-3 pl-4 pr-10 border border-neutral200 font-sora text-[14px] leading-[21px] tracking-[0]"
          placeholder="Search wallets..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            onChangeText?.(text);
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          style={{ height: 48 }}
        />
        {query && (
          <TouchableOpacity 
            className="absolute right-3 top-3"
            onPress={() => setQuery("")}
          >
            <MaterialIcons name="clear" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}