import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, Vibration } from 'react-native';

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
  const loaderPlayer = useVideoPlayer(require('../assets/animation/loader.mp4'), (p) => {
    p.loop = true;
    p.muted = true;
  });
  // Base classes
  let buttonClasses = 'py-3 rounded-xl w-full items-center justify-center h-12';
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
    buttonClasses += ' bg-main';
    textClasses += ' text-neutral800';
  }

  const handlePress = () => {
    // Trigger a short vibration (50ms) when button is pressed
    Vibration.vibrate(50);
    onPress();
  };
  useEffect(() => {
    if (isLoading) loaderPlayer.play();
    else loaderPlayer.pause();
  }, [isLoading]);

  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={handlePress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        outline ? (
          <Text className={textClasses}>Please wait...</Text>
        ) : (
          <VideoView player={loaderPlayer} style={{ width: 30, height: 24 }} contentFit="contain" nativeControls={false} />

        )
      ) : (
        <Text className={textClasses}>{text}</Text>
      )}
    </TouchableOpacity>
  );
}