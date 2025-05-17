import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BackButton from '../../../../../assets/images/back.png';
import CenterImage from '../../../../../assets/images/face-id.png';
import Icon2 from '../../../../../assets/images/FaceMask.png';
import LockIcon from '../../../../../assets/images/lock-3.png';
import Icon1 from '../../../../../assets/images/Sun.png';

export default function FaceScan() {
  const router = useRouter();


  const handleProceed = () => {
      router.push('/sign-up/biometrics/facesetup');
  };

  return (
    <TouchableWithoutFeedback >
      <View className="flex-1 bg-neutral800 px-5 pt-12">
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
        <View className="items-center mb-8">
          <Image 
            source={CenterImage} 
            className="mt-16 mb-8" 
            resizeMode="contain" 
          />
        </View>

        {/* Icon-Text Pairs with proper text wrapping */}
        <View className="mb-8 px-2">
          {/* First Icon-Text Pair */}
          <View className="flex-row mb-6">
            <View className="mr-4 mt-1">
              <Image 
                source={Icon1} 
                className="w-6 h-6" 
                resizeMode="contain" 
              />
            </View>
            <View className="flex-1">
              <Text className="text-white font-sora text-sm flex-wrap" numberOfLines={3}>
                Enroll face in the day time or in a well- lighted environment
              </Text>
            </View>
          </View>

          {/* Second Icon-Text Pair */}
          <View className="flex-row">
            <View className="mr-4 mt-1">
              <Image 
                source={Icon2} 
                className="w-6 h-6" 
                resizeMode="contain" 
              />
            </View>
            <View className="flex-1">
              <Text className="text-white font-sora text-sm flex-wrap" numberOfLines={3}>
                Do not wear any object like mask or glasses that will cover the face
              </Text>
            </View>
          </View>
        </View>

        {/* Proceed Button at Bottom */}
        <View className="flex-1 justify-end pb-8">
          <Button
            text="Proceed"
            onPress={handleProceed}
          />
        </View>


      </View>
    </TouchableWithoutFeedback>
  );
}