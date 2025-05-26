import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BackButton from '../../../../../assets/images/back.png';
import CenterImage from '../../../../../assets/images/fingerprint.png';
import LockIcon from '../../../../../assets/images/lock-3.png';

export default function Fingerprint() {
  const router = useRouter();
  const [showKeypad, setShowKeypad] = useState(false);


  const handleProceed = () => {
      router.push('/(home)');
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowKeypad(false)}>
      <View className="flex-1 bg-neutral800 px-5 pt-12 ">
        {/* Header */}
        <View className="relative flex-row items-center justify-start mb-4">
          <TouchableOpacity className="z-10" onPress={() => router.back()}>
            <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
          </TouchableOpacity>
          <Image
            source={LockIcon}
            className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-[16px]"
            resizeMode="contain"
          />
        </View>

        

        {/* Centered Image */}
        <View className="items-center ">
        <View className="mb-8 px-2">
          {/* First Icon-Text Pair */}
            <View className="mt-10">
              <Text className="text-white font-sora text-sm text-center" numberOfLines={3}>
              Touch Screen to Register Fingerprint
              </Text>
            </View>
         

          {/* Second Icon-Text Pair */}
          <View className="">
            
            <View className="">
              <Text className="text-white font-sora-bold text-2xl text-center mt-8" >
               0%
              </Text>
            </View>
          </View>
        </View>
          <Image 
            source={CenterImage} 
            className="mt-16 " 
            resizeMode="contain" 
          />
        </View>

        {/* Icon-Text Pairs with proper text wrapping */}
        

        {/* Proceed Button at Bottom */}
        <View className="flex-1 justify-end pb-8">
          <Button
            text="Done"
            onPress={handleProceed}
          />
        </View>

        {/* Dismiss Keypad Overlay */}
        {showKeypad && (
          <TouchableWithoutFeedback onPress={() => setShowKeypad(false)}>
            <View className="absolute top-0 left-0 right-0 bottom-80 bg-transparent" />
          </TouchableWithoutFeedback>
        )}

        
      </View>
    </TouchableWithoutFeedback>
  );
}