import React, { useState, useRef } from "react";
import { View, TextInput, ScrollView } from "react-native";

const TwelveSeedPhrases: React.FC = () => {
  const [phrases, setPhrases] = useState<string[]>(Array(12).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(12).fill(null));

  const handlePhraseChange = (text: string, index: number) => {
    const newPhrases = [...phrases];
    newPhrases[index] = text;
    setPhrases(newPhrases);
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.setSelection(text.length, text.length);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    if (phrases[index] === "" && inputRefs.current[index]) {
      inputRefs.current[index]?.setSelection(0, 0);
    }
  };

  return (
    <View className="flex-1 bg-mainBlack p-4">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      >
        <View
          className="flex-row flex-wrap gap-x-2 bg-[#FFFFFF0A] mt-[40px] rounded-[8px]"
          onStartShouldSetResponder={() => true}
        >
          {phrases.map((phrase, index) => (
            <View key={index} className="w-[48%] mb-4">
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={`p-3 rounded-[8px] h-11 w-[155px] mt-4 text-center ${
                  focusedIndex === index || phrase.trim()
                    ? "bg-white text-black"
                    : "bg-neutral300 text-white"
                }`} // Background white if focused or has non-empty text
                value={phrase}
                onChangeText={(text) => handlePhraseChange(text, index)}
                placeholder={phrase.trim() ? "" : `Phrase ${index + 1}`}
                placeholderTextColor="#888"
                onFocus={() => handleFocus(index)}
                onBlur={() => setFocusedIndex(null)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TwelveSeedPhrases;