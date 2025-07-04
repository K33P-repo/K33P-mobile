import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

type ButtonProps = {
  text: string;
  onPress: () => void;
  isDisabled?: boolean;
  outline?: boolean;
  danger?: boolean;
  isLoading?: boolean;
};

export default function Button({
  text,
  onPress,
  isDisabled = false,
  outline = false,
  danger = false,
  isLoading = false,
}: ButtonProps) {
  // Base classes
  let buttonClasses = 'py-3 rounded-xl w-full items-center justify-center';
  let textClasses = 'font-sora-semibold text-sm text-center';

  if (isDisabled) {
    buttonClasses += ' bg-neutral300';
    textClasses += ' text-neutral50';
  } else if (danger) {
    buttonClasses += ' border border-error500/40 bg-transparent';
    textClasses += ' text-error500';
  } else if (outline) {
    buttonClasses += ' border border-main bg-transparent';
    textClasses += ' text-main';
  } else {
    buttonClasses += ' bg-yellow-400';
    textClasses += ' text-neutral800';
  }

  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={
          danger ? '#F44336' : 
          outline ? '#EAB308' : 
          '#000000'
        } />
      ) : (
        <Text className={textClasses}>{text}</Text>
      )}
    </TouchableOpacity>
  );
}