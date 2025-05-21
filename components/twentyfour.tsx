import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  PanResponder,
  Animated,
} from "react-native";
import ArrowRight from "../assets/images/right.png";
import ArrowLeft from "../assets/images/left.png";

const slides = [{ id: 1 }, { id: 2 }];

const TwentyFourSeedPhrases: React.FC = () => {
  const [phrases, setPhrases] = useState<string[]>(Array(24).fill(""));
  const [focusedInputs, setFocusedInputs] = useState<boolean[]>(Array(24).fill(false));
  const [current, setCurrent] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>(Array(24).fill(null));
  const pan = useRef(new Animated.Value(0)).current;

  const handlePhraseChange = (text: string, index: number) => {
    const newPhrases = [...phrases];
    newPhrases[index] = text;
    setPhrases(newPhrases);
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.setSelection(text.length, text.length);
    }
  };

  const handleFocus = (index: number) => {
    const newFocusedInputs = [...focusedInputs];
    newFocusedInputs[index] = true;
    setFocusedInputs(newFocusedInputs);
    if (phrases[index] === "" && inputRefs.current[index]) {
      inputRefs.current[index]?.setSelection(0, 0);
    }
  };

  const handleBlur = (index: number) => {
    const newFocusedInputs = [...focusedInputs];
    newFocusedInputs[index] = false;
    setFocusedInputs(newFocusedInputs);
  };

  const prevSlide = () => {
    if (current === 0) return;
    setCurrent(0);
    Animated.spring(pan, { toValue: 0, useNativeDriver: true }).start();
  };

  const nextSlide = () => {
    if (current === slides.length - 1) return;
    setCurrent(1);
    Animated.spring(pan, { toValue: -100, useNativeDriver: true }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 20,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          prevSlide();
        } else if (gestureState.dx < -50) {
          nextSlide();
        }
        Animated.spring(pan, { toValue: current === 0 ? 0 : -100, useNativeDriver: true }).start();
      },
    })
  ).current;

  const visiblePhrases = current === 0 ? phrases.slice(0, 12) : phrases.slice(12, 24);

  return (
    <View className="flex-1 bg-mainBlack p-4">
      <Animated.View
        className="flex-row flex-wrap gap-x-2 bg-[#FFFFFF0A] mt-[40px] h-[399px] rounded-[8px]"
        {...panResponder.panHandlers}
        onStartShouldSetResponder={() => true}
      >
        {visiblePhrases.map((phrase, index) => {
          const globalIndex = current === 0 ? index : index + 12;
          return (
            <View key={globalIndex} className="w-[48%] mb-4">
              <TextInput
                ref={(el) => (inputRefs.current[globalIndex] = el)}
                className={`p-3 rounded-[8px] h-11 w-[155px] mt-4 text-center ${
                  focusedInputs[globalIndex] || phrases[globalIndex].trim()
                    ? "bg-white text-black"
                    : "bg-neutral300 text-white"
                }`} // Background white if focused or has non-empty text
                value={phrase}
                onChangeText={(text) => handlePhraseChange(text, globalIndex)}
                placeholder={focusedInputs[globalIndex] ? "" : `Phrase ${globalIndex + 1}`}
                placeholderTextColor="#888"
                onFocus={() => handleFocus(globalIndex)}
                onBlur={() => handleBlur(globalIndex)}
              />
            </View>
          );
        })}
      </Animated.View>

      <View className="flex-row items-center justify-between px-4 mt-6">
        <TouchableOpacity onPress={prevSlide} disabled={current === 0}>
          <Image source={ArrowLeft} style={{ opacity: current === 0 ? 0.5 : 1 }} />
        </TouchableOpacity>

        <View className="flex-row gap-3 items-center">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${
                index === current ? "bg-white w-4 h-2" : "bg-neutral100 w-2 h-2"
              }`}
            />
          ))}
        </View>

        <TouchableOpacity onPress={nextSlide} disabled={current === slides.length - 1}>
          <Image source={ArrowRight} style={{ opacity: current === slides.length - 1 ? 0.5 : 1 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TwentyFourSeedPhrases;