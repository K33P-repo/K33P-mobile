import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type ButtonProps = {
  text: string;
  onPress: () => void;
  isDisabled?: boolean;
  outline?: boolean;
  isLoading?: boolean;
};

export function Button({
  text,
  onPress,
  isDisabled = false,
  outline = false,
  isLoading = false,
}: ButtonProps) {
  // Base classes
  let buttonClasses = 'py-3 rounded-lg w-full items-center justify-center';
  let textClasses = 'font-sora-semibold text-lg text-center';

  if (isDisabled) {
    buttonClasses += ' ';
    textClasses += ' text-white';
  } else if (outline) {
    buttonClasses += ' border-2 border-yellow-500 bg-transparent';
    textClasses += ' text-yellow-500';
  } else {
    buttonClasses += ' bg-yellow-400';
    textClasses += ' text-black';
  }

  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={outline ? '#EAB308' : '#000000'} />
      ) : (
        <Text className={textClasses}>{text}</Text>
      )}
    </TouchableOpacity>
  );
}